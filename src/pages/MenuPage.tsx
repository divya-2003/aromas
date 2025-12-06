import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, User, Clock } from "lucide-react";
import { menuItems, menuCategories } from "@/data/menu";
import { MenuItem } from "@/types/menu";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CartSheet } from "@/components/CartSheet";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { CustomizeModal } from "@/components/CustomizeModal";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const { cartItemCount, isAuthenticated, userName } = useApp();
  const navigate = useNavigate();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 gradient-hero">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-foreground"
              >
                QuickBite 🍔
              </motion.h1>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? `Hey, ${userName}!` : "Order ahead, skip the wait"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                size="icon"
                onClick={() => navigate("/orders")}
              >
                <Clock className="h-5 w-5" />
              </Button>
              <Button
                variant="icon"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
              <Button
                variant="icon"
                size="icon"
                onClick={() => navigate(isAuthenticated ? "/profile" : "/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <CategoryTabs
              categories={menuCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="container py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MenuItemCard item={item} onCustomize={setCustomizeItem} />
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or category</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />

      {/* Cart Sheet */}
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Customize Modal */}
      <CustomizeModal
        item={customizeItem}
        isOpen={customizeItem !== null}
        onClose={() => setCustomizeItem(null)}
      />
    </div>
  );
};

export default MenuPage;
