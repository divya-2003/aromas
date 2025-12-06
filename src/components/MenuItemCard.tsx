import { motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Flame } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface MenuItemCardProps {
  item: MenuItem;
  onCustomize: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onCustomize }: MenuItemCardProps) {
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
      <div className="relative h-36 overflow-hidden">
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
          {item.isPopular && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              <Flame className="h-3 w-3" />
              Popular
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

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{item.preparationTime} min</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCustomize(item)}
              className="h-8 px-3 text-xs"
            >
              Customize
            </Button>
            <Button
              size="icon"
              onClick={() => addToCart(item)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
