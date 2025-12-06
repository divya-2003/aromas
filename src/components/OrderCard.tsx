import { motion } from "framer-motion";
import { Order, OrderStatus } from "@/types/menu";
import { Clock, CheckCircle, ChefHat, Package } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  placed: {
    label: "Order Placed",
    color: "bg-accent text-accent-foreground",
    icon: <Clock className="h-4 w-4" />,
  },
  preparing: {
    label: "Preparing",
    color: "bg-warning/20 text-warning",
    icon: <ChefHat className="h-4 w-4" />,
  },
  ready: {
    label: "Ready for Pickup",
    color: "bg-success/20 text-success",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-muted text-muted-foreground",
    icon: <Package className="h-4 w-4" />,
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const itemNames = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl bg-card shadow-card"
    >
      {/* Status Bar */}
      <div className={`flex items-center gap-2 px-4 py-2 ${status.color}`}>
        {status.icon}
        <span className="text-sm font-semibold">{status.label}</span>
        {order.status === "preparing" && (
          <span className="ml-auto text-xs">
            Ready by {order.estimatedReadyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{order.id}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{itemNames}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.placedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between">
            {(["placed", "preparing", "ready", "picked_up"] as OrderStatus[]).map((step, index) => {
              const isCompleted = 
                (["placed", "preparing", "ready", "picked_up"] as OrderStatus[]).indexOf(order.status) >= index;
              const isCurrent = order.status === step;
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isCompleted
                        ? "gradient-warm text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    {statusConfig[step].label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-2 h-1 w-full rounded-full bg-muted">
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: `${
                  (["placed", "preparing", "ready", "picked_up"] as OrderStatus[]).indexOf(order.status) * 33.33 + 16.67
                }%`,
              }}
              className="absolute left-0 h-full rounded-full gradient-warm"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
