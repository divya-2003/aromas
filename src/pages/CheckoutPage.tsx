import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { useLocation as useGeoLocation } from "@/hooks/useLocation";
import { load } from "@cashfreepayments/cashfree-js";
import { supabase } from "@/integrations/supabase/client";

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, cartTotal, clearCart, isAuthenticated, isParcel, parcelCharge, grandTotal } = useApp();
  const navigate = useNavigate();
  const { isWithinPremises, isLoading: isLocationLoading, coordinates } = useGeoLocation();

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please sign in", description: "You need to sign in to place an order", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!isWithinPremises || !coordinates) {
      toast({ title: "Location required", description: "You must be within campus to order", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-session", {
        body: {
          items: cart.map((c) => ({ id: c.id, quantity: c.quantity })),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          isParcel,
        },
      });

      if (error || !data?.paymentSessionId) {
        throw new Error(data?.error || error?.message || "Failed to start payment");
      }

      const cashfree = await load({ mode: data.mode === "production" ? "production" : "sandbox" });
      const result = await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result?.error) {
        toast({ title: "Payment cancelled", description: result.error.message || "Please try again", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // Poll for payment status (webhook will update it shortly)
      let paid = false;
      for (let i = 0; i < 8; i++) {
        const { data: row } = await supabase
          .from("orders")
          .select("payment_status")
          .eq("id", data.orderId)
          .maybeSingle();
        if (row?.payment_status === "paid") { paid = true; break; }
        if (row?.payment_status === "failed") break;
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!paid) {
        toast({ title: "Payment pending", description: "We'll confirm once the gateway notifies us.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      clearCart();
      toast({ title: "🎉 Payment received!", description: "Your order is being prepared" });
      navigate("/bill", { state: { order: data.order } });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Payment failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-background">
          <div className="container flex items-center gap-4 py-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
        </header>
        <div className="container flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="container py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            {isParcel && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Parcel Charge</span>
                <span>₹{parcelCharge}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
          <div className="rounded-2xl bg-card p-4 shadow-card flex items-center gap-3">
            <div className="rounded-full p-2 bg-primary text-primary-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Secure Payment by Cashfree</p>
              <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking & more</p>
            </div>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isProcessing || isLocationLoading || !isWithinPremises}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Processing...
            </span>
          ) : isLocationLoading ? "Verifying location..."
            : !isWithinPremises ? "Outside campus - Cannot order"
            : `Pay ₹${grandTotal}`}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
