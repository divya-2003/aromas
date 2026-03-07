import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Order, OrderStatus } from "@/types/menu";
import { Clock, CheckCircle, ChefHat, Package, Star, Timer, XCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

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
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/20 text-destructive",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const PICKUP_WINDOW_MINUTES = 15;
const CANCEL_WINDOW_MINUTES = 5;

function getTimeDiffMinutes(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 60000);
}

function PickupCountdown({ readyAt }: { readyAt: Date }) {
  const [remainingMs, setRemainingMs] = useState(() => {
    const deadline = new Date(readyAt.getTime() + PICKUP_WINDOW_MINUTES * 60000);
    return Math.max(0, deadline.getTime() - Date.now());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = new Date(readyAt.getTime() + PICKUP_WINDOW_MINUTES * 60000);
      const left = Math.max(0, deadline.getTime() - Date.now());
      setRemainingMs(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [readyAt]);

  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  const progress = (remainingMs / (PICKUP_WINDOW_MINUTES * 60000)) * 100;
  const isUrgent = mins < 5;

  if (remainingMs <= 0) {
    return (
      <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-center">
        <p className="text-sm font-semibold text-destructive">Pickup window expired</p>
      </div>
    );
  }

  return (
    <div className={`mt-3 rounded-xl p-3 ${isUrgent ? "bg-destructive/10" : "bg-success/10"}`}>
      <div className="flex items-center gap-2">
        <Timer className={`h-4 w-4 ${isUrgent ? "text-destructive" : "text-success"}`} />
        <span className={`text-sm font-semibold ${isUrgent ? "text-destructive" : "text-success"}`}>
          Pick up in {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="relative mt-2 h-1.5 w-full rounded-full bg-muted">
        <motion.div
          className={`absolute left-0 h-full rounded-full ${isUrgent ? "bg-destructive" : "bg-success"}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function CancelSection({ order }: { order: Order }) {
  const [remainingMs, setRemainingMs] = useState(() => {
    const deadline = new Date(order.placedAt.getTime() + CANCEL_WINDOW_MINUTES * 60000);
    return Math.max(0, deadline.getTime() - Date.now());
  });
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = new Date(order.placedAt.getTime() + CANCEL_WINDOW_MINUTES * 60000);
      const left = Math.max(0, deadline.getTime() - Date.now());
      setRemainingMs(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [order.placedAt]);

  if (remainingMs <= 0) return null;

  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);

  const handleCancel = async () => {
    setIsCancelling(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);

    if (error) {
      console.error('Order cancellation error:', error);
      toast({ title: "Failed to cancel order", description: "Unable to cancel order. Please try again later.", variant: "destructive" });
    } else {
      toast({ title: "Order cancelled" });
    }
    setIsCancelling(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-destructive" />
          <span className="text-sm text-muted-foreground">
            Cancel within {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelling..." : "Cancel Order"}
        </Button>
      </div>
    </div>
  );
}

function FeedbackSection({ order }: { order: Order }) {
  const [rating, setRating] = useState(order.feedbackRating || 0);
  const [comment, setComment] = useState(order.feedbackComment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!order.feedbackRating);

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl bg-primary/10 p-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">Thanks for your feedback!</span>
        </div>
        {comment && <p className="mt-1 text-xs text-muted-foreground">{comment}</p>}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase
      .from("orders")
      .update({
        feedback_rating: rating,
        feedback_comment: comment || null,
      })
      .eq("id", order.id);

    if (error) {
      console.error('Feedback submission error:', error);
      toast({ title: "Failed to submit feedback", description: "Please try again later.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Feedback submitted! 🎉" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-3 rounded-xl border border-border p-3">
      <p className="text-sm font-semibold">How was your order?</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
            <Star
              className={`h-6 w-6 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Any comments? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 500))}
        className="mt-2 min-h-[60px] text-sm"
      />
      <Button
        size="sm"
        className="mt-2 w-full"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status];
  const itemNames = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

  // Calculate prep time (placed → ready)
  const prepTimeMinutes =
    order.readyAt && order.placedAt
      ? getTimeDiffMinutes(order.placedAt, order.readyAt)
      : null;

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
        {order.status === "preparing" && order.estimatedReadyTime && (
          <span className="ml-auto text-xs">
            Ready by {order.estimatedReadyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {prepTimeMinutes !== null && (order.status === "ready" || order.status === "picked_up") && (
          <span className="ml-auto text-xs">
            Prepared in {prepTimeMinutes} min
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold line-clamp-2">{itemNames}</p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.placedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
        </div>

        {/* Progress - hide for cancelled orders */}
        {order.status !== "cancelled" && (
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
        )}

        {/* Cancel option within 5 minutes of placing */}
        {order.status === "placed" && <CancelSection order={order} />}

        {/* QR Code for pickup when order is ready */}
        {order.status === "ready" && order.pickupToken && (
          <div className="mt-3 rounded-xl bg-card border-2 border-success/30 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">Pickup QR Code</span>
            </div>
            <div className="flex justify-center bg-white rounded-lg p-3 inline-block mx-auto">
              <QRCodeSVG
                value={JSON.stringify({ orderId: order.id, token: order.pickupToken })}
                size={160}
                level="H"
              />
            </div>
            <p className="text-xs text-muted-foreground">Show this QR code at the counter for pickup</p>
            <p className="text-xs font-mono font-bold text-primary">{order.pickupToken}</p>
          </div>
        )}

        {/* Pickup countdown when order is ready */}
        {order.status === "ready" && order.readyAt && (
          <PickupCountdown readyAt={order.readyAt} />
        )}

        {/* Feedback section after pickup */}
        {order.status === "picked_up" && <FeedbackSection order={order} />}
      </div>
    </motion.div>
  );
}
