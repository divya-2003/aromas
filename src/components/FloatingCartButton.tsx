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
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="fixed bottom-6 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-warm shadow-glow"
      >
        <div className="relative">
          <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-card text-xs font-bold text-primary">
            {cartItemCount}
          </span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
