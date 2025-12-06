import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { cartItemCount, cartTotal } = useApp();

  if (cartItemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="fixed bottom-6 left-4 right-4 z-30 flex items-center justify-between rounded-2xl gradient-warm p-4 shadow-glow"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-card text-xs font-bold text-primary">
              {cartItemCount}
            </span>
          </div>
          <span className="font-semibold text-primary-foreground">View Cart</span>
        </div>
        <span className="text-lg font-bold text-primary-foreground">₹{cartTotal}</span>
      </motion.button>
    </AnimatePresence>
  );
}
