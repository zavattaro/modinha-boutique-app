export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'roupas-femininas' | 'roupas-masculinas' | 'utilidades';
  subcategory: string;
  images: string[];
  stock: number;
  status: 'ativo' | 'inativo';
  variations?: ProductVariation[];
  attributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface ProductVariation {
  id: string;
  sku: string;
  attributes: Record<string, string>; // {size: "M", color: "Azul"}
  stock: number;
  price?: number;
  image?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
  attributes?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  whatsappSent?: boolean;
}