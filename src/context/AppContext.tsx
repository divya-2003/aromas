import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, MenuItem, Order, OrderStatus } from "@/types/menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AppContextType {
  cart: CartItem[];
  orders: Order[];
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  specialInstructions: string;
  isParcel: boolean;
  addToCart: (item: MenuItem, quantity?: number, customizations?: string[], specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSpecialInstructions: (instructions: string) => void;
  setIsParcel: (isParcel: boolean) => void;
  clearCart: () => void;
  placeOrder: (userLocation?: { latitude: number; longitude: number }) => Promise<Order | null>;
  login: (name: string, email: string) => void;
  logout: () => void;
  cartTotal: number;
  cartItemCount: number;
  parcelCharge: number;
  grandTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isParcel, setIsParcel] = useState(false);

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        setUserName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "");
      } else {
        setIsAuthenticated(false);
        setUserName("");
        setUserEmail("");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        setUserName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch orders from database when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('placed_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching orders:', error);
        }
        toast({
          title: "Unable to load orders",
          description: "Please try again later",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const mappedOrders: Order[] = data.map((order: any) => ({
          id: order.id,
          items: order.items as CartItem[],
          totalAmount: order.total_amount,
          status: order.status as OrderStatus,
          placedAt: new Date(order.placed_at),
          estimatedReadyTime: order.estimated_ready_time ? new Date(order.estimated_ready_time) : undefined,
          specialInstructions: order.special_instructions,
        }));
        setOrders(mappedOrders);
      }
    };

    fetchOrders();

    // Subscribe to realtime updates for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as any;
            const mappedOrder: Order = {
              id: newOrder.id,
              items: newOrder.items as CartItem[],
              totalAmount: newOrder.total_amount,
              status: newOrder.status as OrderStatus,
              placedAt: new Date(newOrder.placed_at),
              estimatedReadyTime: newOrder.estimated_ready_time ? new Date(newOrder.estimated_ready_time) : undefined,
              specialInstructions: newOrder.special_instructions,
            };
            setOrders(prev => [mappedOrder, ...prev.filter(o => o.id !== mappedOrder.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as any;
            setOrders(prev => prev.map(order => 
              order.id === updatedOrder.id 
                ? {
                    ...order,
                    status: updatedOrder.status as OrderStatus,
                    estimatedReadyTime: updatedOrder.estimated_ready_time ? new Date(updatedOrder.estimated_ready_time) : undefined,
                  }
                : order
            ));
            
            // Show toast when order is ready
            if (updatedOrder.status === 'ready') {
              toast({
                title: "🎉 Your order is ready!",
                description: `Order is ready for pickup`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

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
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    if (quantity > 20) {
      toast({
        title: "Quantity limit",
        description: "Maximum 20 items per item type",
        variant: "destructive",
      });
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const updateSpecialInstructions = (instructions: string) => {
    if (instructions.length > 1000) {
      toast({
        title: "Too long",
        description: "Special instructions must be under 1000 characters",
        variant: "destructive",
      });
      return;
    }
    setSpecialInstructions(instructions);
  };

  const clearCart = () => {
    setCart([]);
    setSpecialInstructions("");
    setIsParcel(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const parcelCharge = isParcel ? 10 : 0;
  const grandTotal = cartTotal + parcelCharge;

  const placeOrder = async (userLocation?: { latitude: number; longitude: number }): Promise<Order | null> => {
    if (cart.length === 0) return null;

    // Require location for order placement (server will validate)
    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please enable location services to place your order.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Call server-side edge function for validated order creation
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            customizations: item.customizations,
            specialInstructions: item.specialInstructions,
          })),
          specialInstructions,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Order creation error:', error);
        }
        toast({
          title: "Order failed",
          description: "Unable to place order. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data?.success || !data?.order) {
        if (import.meta.env.DEV) {
          console.error('Order creation failed:', data?.error);
        }
        toast({
          title: "Order failed",
          description: "Unable to place order. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const newOrder: Order = {
        id: data.order.id,
        items: data.order.items as CartItem[],
        totalAmount: data.order.totalAmount,
        status: data.order.status as OrderStatus,
        placedAt: new Date(data.order.placedAt),
        estimatedReadyTime: data.order.estimatedReadyTime ? new Date(data.order.estimatedReadyTime) : undefined,
        specialInstructions: data.order.specialInstructions,
      };

      clearCart();
      return newOrder;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Unexpected error placing order:', error);
      }
      toast({
        title: "Order failed",
        description: "Unable to place order. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const login = (name: string, email: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    setUserEmail(email);
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
        isParcel,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSpecialInstructions,
        setIsParcel,
        clearCart,
        placeOrder,
        login,
        logout,
        cartTotal,
        cartItemCount,
        parcelCharge,
        grandTotal,
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
