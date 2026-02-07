export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isBestSeller?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  placedAt: Date;
  estimatedReadyTime: Date;
  readyAt?: Date;
  specialInstructions?: string;
  feedbackRating?: number;
  feedbackComment?: string;
}

export type OrderStatus = 
  | "placed" 
  | "preparing" 
  | "ready" 
  | "picked_up";

export interface User {
  id: string;
  name: string;
  email: string;
}
