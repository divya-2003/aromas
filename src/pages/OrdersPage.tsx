import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { OrderCard } from "@/components/OrderCard";

const OrdersPage = () => {
  const { orders, isAuthenticated } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Your Orders</h1>
        </div>
      </header>

      <main className="container py-6">
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">Sign in to view orders</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your orders and order history
            </p>
            <Button className="mt-4" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="rounded-full bg-muted p-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">No orders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your order history will appear here
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Browse Menu
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
