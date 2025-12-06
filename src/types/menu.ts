export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isPopular: boolean;
  preparationTime: number;
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
  studentId: string;
}
