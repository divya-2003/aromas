import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { menuItems, menuCategories } from "@/data/menu";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CartSheet } from "@/components/CartSheet";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { LocationBadge } from "@/components/LocationGate";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const { cartItemCount, isAuthenticated, userName, orders } = useApp();
  
  // Get active orders (not picked up yet)
  const activeOrders = orders.filter(order => order.status !== "picked_up");

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVegFilter = 
      vegFilter === "all" || 
      (vegFilter === "veg" && item.isVeg) || 
      (vegFilter === "nonveg" && !item.isVeg);
    return matchesCategory && matchesSearch && matchesVegFilter;
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
                Aromas 🍔
              </motion.h1>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? `Hey, ${userName}!` : "Order ahead, skip the wait"}
              </p>
              <LocationBadge />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <ProfileDropdown />
            </div>
          </div>

          {/* Search (Collapsible) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Tabs */}
          <div className="mt-4">
            <CategoryTabs
              categories={menuCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Veg/Non-Veg Filter */}
          <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex gap-2"
            >
              <Button
                variant={vegFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setVegFilter("all")}
                className="rounded-full"
              >
                All
              </Button>
              <Button
                variant={vegFilter === "veg" ? "default" : "outline"}
                size="sm"
                onClick={() => setVegFilter("veg")}
                className="rounded-full gap-1.5"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                </span>
                Veg
              </Button>
              <Button
                variant={vegFilter === "nonveg" ? "default" : "outline"}
                size="sm"
                onClick={() => setVegFilter("nonveg")}
                className="rounded-full gap-1.5"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-destructive">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                </span>
                Non-Veg
              </Button>
            </motion.div>
          </motion.div>
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
              <MenuItemCard item={item} />
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
    </div>
  );
};

export default MenuPage;
