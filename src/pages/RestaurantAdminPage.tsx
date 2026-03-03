import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, CheckCircle, Clock, Package, Bell, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AdminOrder {
  id: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  placed_at: string;
  special_instructions: string | null;
  estimated_ready_time: string | null;
}

const statusStyles: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  placed: { label: "New Order", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: <Bell className="h-4 w-4" /> },
  preparing: { label: "Preparing", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: <ChefHat className="h-4 w-4" /> },
  ready: { label: "Ready", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: <CheckCircle className="h-4 w-4" /> },
  picked_up: { label: "Picked Up", color: "bg-muted text-muted-foreground border-border", icon: <Package className="h-4 w-4" /> },
};

export default function RestaurantAdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<AdminOrder | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchOrders();

    // Poll every 15 seconds as fallback
    const interval = setInterval(fetchOrders, 15000);

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as AdminOrder;
          setOrders(prev => {
            if (prev.some(o => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
          setNewOrderAlert(newOrder);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as AdminOrder;
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          if (selectedOrder?.id === updated.id) {
            setSelectedOrder(updated);
          }
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    const { data, error } = await supabase.functions.invoke('get-admin-orders');
    if (!error && data?.orders) setOrders(data.orders as AdminOrder[]);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase.functions.invoke('update-order-status', {
      body: { orderId, newStatus },
    });

    if (error) {
      console.error('Status update error:', error);
      toast({ title: "Failed to update status", description: "Please try again.", variant: "destructive" });
    } else {
      toast({ title: `Order marked as ${newStatus === 'preparing' ? 'Preparing' : newStatus === 'ready' ? 'Ready' : 'Picked Up'}` });
    }
    setIsUpdating(false);
    setSelectedOrder(null);
  };

  const getNextStatus = (current: string) => {
    if (current === 'placed') return 'preparing';
    if (current === 'preparing') return 'ready';
    if (current === 'ready') return 'picked_up';
    return null;
  };

  const getNextLabel = (current: string) => {
    if (current === 'placed') return 'Start Preparing';
    if (current === 'preparing') return 'Mark as Ready';
    if (current === 'ready') return 'Mark as Picked Up';
    return null;
  };

  const activeOrders = orders.filter(o => ['placed', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'picked_up');

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ChefHat className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Please sign in to access the admin panel</p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="container flex items-center gap-3 py-4">
          <ChefHat className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Restaurant Dashboard</h1>
          <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {activeOrders.length} active
          </span>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Active Orders */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
          {activeOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No active orders</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {activeOrders.map(order => {
                  const style = statusStyles[order.status] || statusStyles.placed;
                  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="cursor-pointer rounded-2xl border border-border bg-card shadow-card hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className={`flex items-center gap-2 rounded-t-2xl border-b px-4 py-2.5 ${style.color}`}>
                        {style.icon}
                        <span className="text-sm font-semibold">{style.label}</span>
                        <span className="ml-auto text-xs opacity-70">
                          {new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">#{order.id.slice(0, 8)}</p>
                        <ul className="space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        {order.special_instructions && (
                          <p className="mt-2 text-xs italic text-muted-foreground border-t border-border pt-2">
                            📝 {order.special_instructions}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <span className="font-bold">₹{order.total_amount}</span>
                          <span className="text-xs text-primary font-medium">Tap to update →</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Completed</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map(order => {
                const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
                return (
                  <div key={order.id} className="rounded-xl border border-border bg-muted/30 p-4 opacity-60">
                    <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm mt-1">{items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    <p className="text-sm font-medium mt-1">₹{order.total_amount}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Order Status Update Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (() => {
          const items = (Array.isArray(selectedOrder.items) ? selectedOrder.items : []) as OrderItem[];
          const nextStatus = getNextStatus(selectedOrder.status);
          const nextLabel = getNextLabel(selectedOrder.status);
          const style = statusStyles[selectedOrder.status] || statusStyles.placed;

          return (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {style.icon}
                  Order #{selectedOrder.id.slice(0, 8)}
                </DialogTitle>
                <DialogDescription>
                  Update the status of this order
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${style.color}`}>
                  {style.icon}
                  {style.label}
                </div>

                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {selectedOrder.special_instructions && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Special Instructions</p>
                    <p className="text-sm">{selectedOrder.special_instructions}</p>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
                  <span>Total</span>
                  <span className="text-primary">₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {nextStatus && nextLabel && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => updateStatus(selectedOrder.id, nextStatus)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Updating...
                      </span>
                    ) : (
                      nextLabel
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* New Order Alert Dialog */}
      <Dialog open={!!newOrderAlert} onOpenChange={(open) => !open && setNewOrderAlert(null)}>
        {newOrderAlert && (() => {
          const items = (Array.isArray(newOrderAlert.items) ? newOrderAlert.items : []) as OrderItem[];
          return (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary">
                  <Bell className="h-5 w-5 animate-bounce" />
                  🔔 New Order Received!
                </DialogTitle>
                <DialogDescription>
                  A new order has been placed
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">#{newOrderAlert.id.slice(0, 8)}</p>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {newOrderAlert.special_instructions && (
                  <p className="text-xs italic text-muted-foreground">📝 {newOrderAlert.special_instructions}</p>
                )}
                <div className="font-bold text-lg border-t pt-3">
                  Total: <span className="text-primary">₹{newOrderAlert.total_amount}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setNewOrderAlert(null)}>
                  Dismiss
                </Button>
                <Button onClick={() => {
                  setNewOrderAlert(null);
                  const order = orders.find(o => o.id === newOrderAlert.id);
                  if (order) setSelectedOrder(order);
                }}>
                  Start Preparing
                </Button>
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
