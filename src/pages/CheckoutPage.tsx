import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

const paymentMethods = [
  { id: "upi", name: "UPI", icon: Smartphone, description: "Google Pay, PhonePe, Paytm" },
  { id: "card", name: "Card", icon: CreditCard, description: "Credit/Debit Card" },
  { id: "wallet", name: "Wallet", icon: Wallet, description: "Campus Wallet" },
];

const CheckoutPage = () => {
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, cartTotal, placeOrder, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const order = placeOrder();
    setIsProcessing(false);

    if (order) {
      toast({
        title: "🎉 Order placed successfully!",
        description: `Order ${order.id} is being prepared`,
      });
      navigate("/orders");
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
          <Button className="mt-4" onClick={() => navigate("/")}>
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="container py-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-4 shadow-card"
        >
          <h2 className="font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Convenience Fee</span>
              <span>₹5</span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{cartTotal + 5}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h2 className="font-semibold">Payment Method</h2>
          <div className="mt-4 space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                  selectedPayment === method.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div
                  className={`rounded-full p-2 ${
                    selectedPayment === method.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <method.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      selectedPayment === method.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <Button
          className="w-full"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Processing...
            </span>
          ) : (
            `Pay ₹${cartTotal + 5}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
