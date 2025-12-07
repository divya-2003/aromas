import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, MenuItem, Order, OrderStatus } from "@/types/menu";
import { toast } from "@/hooks/use-toast";

interface AppContextType {
  cart: CartItem[];
  orders: Order[];
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  specialInstructions: string;
  addToCart: (item: MenuItem, quantity?: number, customizations?: string[], specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSpecialInstructions: (instructions: string) => void;
  clearCart: () => void;
  placeOrder: () => Order | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  cartTotal: number;
  cartItemCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const addToCart = (
    item: MenuItem, 
    quantity = 1, 
    customizations: string[] = [], 
    itemSpecialInstructions = ""
  ) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity, customizations, specialInstructions: itemSpecialInstructions }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const updateSpecialInstructions = (instructions: string) => {
    setSpecialInstructions(instructions);
  };

  const clearCart = () => {
    setCart([]);
    setSpecialInstructions("");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = (): Order | null => {
    if (cart.length === 0) return null;

    // Default preparation time of 15 minutes
    const estimatedReadyTime = new Date();
    estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + 15);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      totalAmount: cartTotal,
      status: "placed",
      placedAt: new Date(),
      estimatedReadyTime,
      specialInstructions,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Simulate order status updates
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === newOrder.id ? { ...o, status: "preparing" as OrderStatus } : o))
      );
    }, 5000);

    setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === newOrder.id ? { ...o, status: "ready" as OrderStatus } : o))
      );
      toast({
        title: "🎉 Your order is ready!",
        description: `Order ${newOrder.id} is ready for pickup`,
      });
    }, 15000);

    return newOrder;
  };

  const login = (name: string, email: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    setUserEmail(email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName("");
    setUserEmail("");
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        orders,
        isAuthenticated,
        userName,
        userEmail,
        specialInstructions,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        placeOrder,
        login,
        logout,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
