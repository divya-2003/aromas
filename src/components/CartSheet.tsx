import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, Trash2, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const { cart, cartTotal, updateQuantity, removeFromCart, updateSpecialInstructions } = useApp();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const handleSaveInstructions = () => {
    updateSpecialInstructions(instructions);
    setShowInstructions(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Your Cart</h2>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {cart.length}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-muted p-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Add some delicious items to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-3 rounded-xl bg-card p-3 shadow-card"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">{item.name}</h4>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.customizations.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">
                            ₹{item.price * item.quantity}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instructions & Footer */}
            {cart.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Special Instructions */}
                <div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    <FileText className="h-4 w-4" />
                    {instructions ? "Edit Special Instructions" : "Add Special Instructions"}
                  </Button>
                  
                  <AnimatePresence>
                    {showInstructions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          <Textarea
                            placeholder="E.g., Less spicy, no onions, extra sauce..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button size="sm" onClick={handleSaveInstructions}>
                            Save Instructions
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {instructions && !showInstructions && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      "{instructions}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold">₹{cartTotal}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
