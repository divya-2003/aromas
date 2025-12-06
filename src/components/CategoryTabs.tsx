import { motion } from "framer-motion";

interface CategoryTabsProps {
  categories: { id: string; name: string; icon: string }[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category.id)}
          className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeCategory === category.id
              ? "gradient-warm text-primary-foreground shadow-glow"
              : "bg-card text-muted-foreground hover:bg-secondary"
          }`}
        >
          <span className="text-base">{category.icon}</span>
          <span>{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
