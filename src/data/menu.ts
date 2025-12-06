import { MenuItem } from "@/types/menu";
import butterChicken from "@/assets/butter-chicken.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";
import vegBiryani from "@/assets/veg-biryani.jpg";
import chickenBiryani from "@/assets/chicken-biryani.jpg";
import samosa from "@/assets/samosa.jpg";
import frenchFries from "@/assets/french-fries.jpg";
import chickenMomos from "@/assets/chicken-momos.jpg";
import masalaChai from "@/assets/masala-chai.jpg";
import coldCoffee from "@/assets/cold-coffee.jpg";
import limeSoda from "@/assets/lime-soda.jpg";
import gulabJamun from "@/assets/gulab-jamun.jpg";
import iceCreamSundae from "@/assets/ice-cream-sundae.jpg";

export const menuCategories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "main", name: "Main Course", icon: "🍛" },
  { id: "snacks", name: "Snacks", icon: "🍟" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces, served with rice",
    price: 120,
    category: "main",
    image: butterChicken,
    isVeg: false,
    isPopular: true,
    preparationTime: 15,
  },
  {
    id: "2",
    name: "Paneer Tikka Masala",
    description: "Grilled cottage cheese in rich, spicy gravy with aromatic spices",
    price: 100,
    category: "main",
    image: paneerTikka,
    isVeg: true,
    isPopular: true,
    preparationTime: 12,
  },
  {
    id: "3",
    name: "Veg Biryani",
    description: "Fragrant basmati rice layered with mixed vegetables and spices",
    price: 90,
    category: "main",
    image: vegBiryani,
    isVeg: true,
    isPopular: false,
    preparationTime: 18,
  },
  {
    id: "4",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken and traditional spices",
    price: 130,
    category: "main",
    image: chickenBiryani,
    isVeg: false,
    isPopular: true,
    preparationTime: 20,
  },
  {
    id: "5",
    name: "Samosa (2 pcs)",
    description: "Crispy pastry filled with spiced potatoes and peas",
    price: 30,
    category: "snacks",
    image: samosa,
    isVeg: true,
    isPopular: true,
    preparationTime: 5,
  },
  {
    id: "6",
    name: "French Fries",
    description: "Golden crispy fries with seasoning and dipping sauce",
    price: 50,
    category: "snacks",
    image: frenchFries,
    isVeg: true,
    isPopular: false,
    preparationTime: 8,
  },
  {
    id: "7",
    name: "Chicken Momos (6 pcs)",
    description: "Steamed dumplings filled with spiced chicken, served with chutney",
    price: 60,
    category: "snacks",
    image: chickenMomos,
    isVeg: false,
    isPopular: true,
    preparationTime: 10,
  },
  {
    id: "8",
    name: "Masala Chai",
    description: "Traditional Indian spiced tea with milk",
    price: 20,
    category: "beverages",
    image: masalaChai,
    isVeg: true,
    isPopular: true,
    preparationTime: 3,
  },
  {
    id: "9",
    name: "Cold Coffee",
    description: "Refreshing iced coffee blended with milk and cream",
    price: 50,
    category: "beverages",
    image: coldCoffee,
    isVeg: true,
    isPopular: false,
    preparationTime: 5,
  },
  {
    id: "10",
    name: "Fresh Lime Soda",
    description: "Tangy lime with soda, choice of sweet or salted",
    price: 35,
    category: "beverages",
    image: limeSoda,
    isVeg: true,
    isPopular: false,
    preparationTime: 3,
  },
  {
    id: "11",
    name: "Gulab Jamun (2 pcs)",
    description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
    price: 40,
    category: "desserts",
    image: gulabJamun,
    isVeg: true,
    isPopular: true,
    preparationTime: 2,
  },
  {
    id: "12",
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce and nuts",
    price: 60,
    category: "desserts",
    image: iceCreamSundae,
    isVeg: true,
    isPopular: false,
    preparationTime: 3,
  },
];
