import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface CustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const customizationOptions = [
  { id: "extra-spicy", label: "Extra Spicy", price: 10 },
  { id: "less-oil", label: "Less Oil", price: 0 },
  { id: "extra-cheese", label: "Extra Cheese", price: 20 },
  { id: "no-onion", label: "No Onion", price: 0 },
  { id: "extra-gravy", label: "Extra Gravy", price: 15 },
];

export function CustomizeModal({ item, isOpen, onClose }: CustomizeModalProps) {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const extraCost = selectedOptions.reduce((sum, optionId) => {
    const option = customizationOptions.find((o) => o.id === optionId);
    return sum + (option?.price || 0);
  }, 0);

  const totalPrice = item ? (item.price + extraCost) * quantity : 0;

  const handleAddToCart = () => {
    if (!item) return;
    
    const customizationLabels = selectedOptions.map(
      (id) => customizationOptions.find((o) => o.id === id)?.label || ""
    );
    
    addToCart(item, quantity, customizationLabels, specialInstructions);
    onClose();
    setQuantity(1);
    setSelectedOptions([]);
    setSpecialInstructions("");
  };

  if (!item) return null;

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

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-background p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Customize your order</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              {/* Item Info */}
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <span className="font-bold text-primary">₹{item.price}</span>
                </div>
              </div>

              {/* Customizations */}
              <div className="mt-6">
                <h4 className="mb-3 font-semibold">Add-ons & Preferences</h4>
                <div className="space-y-3">
                  {customizationOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between rounded-xl bg-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={option.id}
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={() => handleOptionToggle(option.id)}
                        />
                        <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                      {option.price > 0 && (
                        <span className="text-sm text-muted-foreground">+₹{option.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mt-6">
                <h4 className="mb-3 font-semibold">Special Instructions</h4>
                <Textarea
                  placeholder="Any specific requests? (e.g., allergies, preferences)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="resize-none"
                />
              </div>

              {/* Quantity */}
              <div className="mt-6 flex items-center justify-between rounded-xl bg-card p-4">
                <span className="font-semibold">Quantity</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-lg font-semibold">{quantity}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-6 pb-6">
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  Add to Cart • ₹{totalPrice}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
