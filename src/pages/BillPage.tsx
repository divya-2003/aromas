import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Receipt, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation } from "react-router-dom";
import { Order } from "@/types/menu";

const BillPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  useEffect(() => {
    if (!order) {
      navigate("/orders");
    }
  }, [order, navigate]);

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const parcelCharge = order.totalAmount - subtotal;
  const hasParcel = parcelCharge > 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden in print */}
      <header className="sticky top-0 z-20 border-b border-border bg-background print:hidden">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Order Bill</h1>
        </div>
      </header>

      <main className="container max-w-md py-6">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex flex-col items-center gap-2 text-center print:hidden"
        >
          <div className="rounded-full bg-success/20 p-3">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-lg font-bold">Order Placed Successfully!</h2>
          <p className="text-sm text-muted-foreground">Here's your bill</p>
        </motion.div>

        {/* Bill Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          {/* Restaurant Header */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary">Sukh Sagar</h3>
            <p className="text-xs text-muted-foreground mt-1">College Canteen</p>
          </div>

          <Separator className="my-4" />

          {/* Order Info */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono font-medium">#{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Date & Time</span>
            <span className="font-medium">
              {order.placedAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              {order.placedAt.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Items Table */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>
            <Separator className="my-2" />
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1.5">
                <span className="flex-1 font-medium">{item.name}</span>
                <span className="w-10 text-center text-muted-foreground">{item.quantity}</span>
                <span className="w-16 text-right text-muted-foreground">₹{item.price}</span>
                <span className="w-16 text-right font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {hasParcel && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Parcel Charge</span>
                <span>₹{parcelCharge}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-primary">₹{order.totalAmount}</span>
            </div>
          </div>

          {order.specialInstructions && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Special Instructions</p>
                <p className="text-sm mt-1 italic">"{order.specialInstructions}"</p>
              </div>
            </>
          )}

          <Separator className="my-4" />

          <p className="text-center text-xs text-muted-foreground">
            Thank you for your order! 🙏
          </p>
        </motion.div>

        {/* Action Buttons - hidden in print */}
        <div className="mt-6 flex gap-3 print:hidden">
          <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
            <Download className="h-4 w-4" />
            Save Bill
          </Button>
          <Button className="flex-1" onClick={() => navigate("/orders")}>
            Track Order
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BillPage;
