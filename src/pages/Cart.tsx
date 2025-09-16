import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const shipping = total >= 299 ? 0 : 29.90;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-8">
            Que tal dar uma olhada nos nossos produtos incríveis?
          </p>
          <Link to="/produtos">
            <Button variant="gradient" size="lg">
              Começar a comprar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Carrinho de Compras</h1>
        <p className="text-muted-foreground">
          {itemCount} item{itemCount > 1 ? 's' : ''} no seu carrinho
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clear Cart Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Itens</h2>
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              Limpar carrinho
            </Button>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-md object-cover bg-muted"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          
                          {/* Attributes */}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(item.attributes).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs bg-muted px-2 py-1 rounded-full"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-lg font-bold text-primary mt-2">
                            {formatPrice(item.price)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Subtotal:</p>
                          <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 bg-gradient-card border-border/50 shadow-elegant">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount > 1 ? 'itens' : 'item'})</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'GRÁTIS' : formatPrice(shipping)}
                  </span>
                </div>

                {/* Shipping notice */}
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Frete grátis para compras acima de {formatPrice(299)}
                  </p>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-3">
                {user ? (
                  <Link to="/checkout">
                    <Button className="w-full" variant="gradient" size="lg">
                      Finalizar Compra
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
                    <Button className="w-full" variant="gradient" size="lg">
                      Fazer Login para Continuar
                    </Button>
                  </Link>
                )}
                
                <Link to="/produtos">
                  <Button variant="outline" className="w-full">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>

              {/* Payment Info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Formas de pagamento:</p>
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-5 bg-muted rounded text-xs flex items-center justify-center font-bold">PIX</div>
                  <div className="w-8 h-5 bg-muted rounded text-xs flex items-center justify-center">💳</div>
                  <div className="w-8 h-5 bg-muted rounded text-xs flex items-center justify-center">🏦</div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                Compra 100% segura e protegida
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}