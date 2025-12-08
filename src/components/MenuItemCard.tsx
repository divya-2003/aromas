import { motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Plus, Award } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
              item.isVeg 
                ? "border-2 border-success bg-card" 
                : "border-2 border-destructive bg-card"
            }`}
          >
            <span 
              className={`h-2 w-2 rounded-full ${
                item.isVeg ? "bg-success" : "bg-destructive"
              }`} 
            />
          </span>
          {item.isBestSeller && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Award className="h-3 w-3" />
              Best Seller
            </span>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-card px-3 py-1 text-sm font-bold text-foreground shadow-md">
            ₹{item.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-end">
          <Button
            size="icon"
            onClick={() => addToCart(item)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
