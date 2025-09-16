import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, attributes?: Record<string, string>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('ubisshop_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('ubisshop_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, attributes?: Record<string, string>) => {
    const cartItemId = `${product.id}_${JSON.stringify(attributes || {})}`;
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === cartItemId);
      
      if (existingItem) {
        toast({
          title: "Produto atualizado",
          description: `${product.name} - quantidade atualizada no carrinho`,
        });
        return currentItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0],
        attributes: attributes || {}
      };

      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho`,
      });

      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(currentItems => {
      const removedItem = currentItems.find(item => item.id === itemId);
      if (removedItem) {
        toast({
          title: "Produto removido",
          description: `${removedItem.name} foi removido do carrinho`,
        });
      }
      return currentItems.filter(item => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os produtos foram removidos do carrinho",
    });
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}