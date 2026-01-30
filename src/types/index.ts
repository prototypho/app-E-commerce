export type Role = 'admin' | 'customer';

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string; // Could be json or string
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[]; // Stored as JSONB in Supabase
  total: number;
  status: OrderStatus;
  shipping_address: string;
  created_at?: string;
}
