import { MenuItem } from "@/types/menu";
import butterChicken from "@/assets/butter-chicken.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";
import vegBiryani from "@/assets/veg-biryani.jpg";
import chickenBiryani from "@/assets/chicken-biryani.jpg";
import frenchFriesNew from "@/assets/french-fries-new.jpg";
import chickenMomosNew from "@/assets/chicken-momos-new.jpg";
import masalaChaiNew from "@/assets/masala-chai-new.jpg";
import coldCoffee from "@/assets/cold-coffee.jpg";
import hotCoffee from "@/assets/hot-coffee.jpg";
import limeSoda from "@/assets/lime-soda.jpg";
import gulabJamun from "@/assets/gulab-jamun.jpg";
import iceCreamSundae from "@/assets/ice-cream-sundae.jpg";
import whiteSaucePastaNew from "@/assets/white-sauce-pasta-new.jpg";
import redSaucePastaNew from "@/assets/red-sauce-pasta-new.jpg";
import pinkSaucePasta from "@/assets/pink-sauce-pasta.jpg";
import paneerButterMasala from "@/assets/paneer-butter-masala.jpg";
import buttermilk from "@/assets/buttermilk.jpg";
import chickenBurger from "@/assets/chicken-burger.jpg";
import alooTikkiBurger from "@/assets/aloo-tikki-burger.jpg";
import paniPuri from "@/assets/pani-puri.jpg";
import dahiPuri from "@/assets/dahi-puri.jpg";
import manchowSoup from "@/assets/manchow-soup.jpg";
import plainMaggi from "@/assets/plain-maggi.jpg";
import vegMaggi from "@/assets/veg-maggi.jpg";
import cheeseMaggi from "@/assets/cheese-maggi.jpg";

export const menuCategories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "main", name: "Main Course", icon: "🍛" },
  { id: "snacks", name: "Snacks", icon: "🍟" },
  { id: "soups", name: "Soups", icon: "🍜" },
  { id: "maggi", name: "Maggi", icon: "🍝" },
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
  },
  {
    id: "2",
    name: "Paneer Tikka Masala",
    description: "Grilled cottage cheese in rich, spicy gravy with aromatic spices",
    price: 100,
    category: "main",
    image: paneerTikka,
    isVeg: true,
  },
  {
    id: "3",
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes in rich, creamy tomato gravy with butter and cream",
    price: 110,
    category: "main",
    image: paneerButterMasala,
    isVeg: true,
  },
  {
    id: "4",
    name: "Veg Biryani",
    description: "Fragrant basmati rice layered with mixed vegetables and spices",
    price: 90,
    category: "main",
    image: vegBiryani,
    isVeg: true,
  },
  {
    id: "5",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken and traditional spices",
    price: 130,
    category: "main",
    image: chickenBiryani,
    isVeg: false,
  },
  {
    id: "6",
    name: "White Sauce Pasta",
    description: "Creamy pasta in rich white sauce with herbs and parmesan",
    price: 130,
    category: "main",
    image: whiteSaucePastaNew,
    isVeg: true,
  },
  {
    id: "7",
    name: "Red Sauce Pasta",
    description: "Classic pasta in tangy tomato sauce with Italian herbs",
    price: 80,
    category: "main",
    image: redSaucePastaNew,
    isVeg: true,
  },
  {
    id: "8",
    name: "Pink Sauce Pasta",
    description: "Perfect blend of creamy white and tangy red sauce pasta",
    price: 90,
    category: "main",
    image: pinkSaucePasta,
    isVeg: true,
  },
  {
    id: "10",
    name: "French Fries",
    description: "Golden crispy fries with seasoning and dipping sauce",
    price: 50,
    category: "snacks",
    image: frenchFriesNew,
    isVeg: true,
  },
  {
    id: "11",
    name: "Chicken Momos (6 pcs)",
    description: "Steamed dumplings filled with spiced chicken, served with chutney",
    price: 60,
    category: "snacks",
    image: chickenMomosNew,
    isVeg: false,
  },
  {
    id: "17",
    name: "Chicken Burger",
    description: "Crispy chicken patty with cheese, lettuce, tomato in a sesame bun",
    price: 80,
    category: "snacks",
    image: chickenBurger,
    isVeg: false,
  },
  {
    id: "18",
    name: "Aloo Tikki Burger",
    description: "Crispy potato patty with green chutney, onions, lettuce in a soft bun",
    price: 60,
    category: "snacks",
    image: alooTikkiBurger,
    isVeg: true,
  },
  {
    id: "19",
    name: "Pani Puri (6 pcs)",
    description: "Crispy puris with spiced water, tamarind chutney and potato filling",
    price: 50,
    category: "snacks",
    image: paniPuri,
    isVeg: true,
  },
  {
    id: "20",
    name: "Dahi Puri (6 pcs)",
    description: "Crispy puris topped with yogurt, chutneys, sev and coriander",
    price: 50,
    category: "snacks",
    image: dahiPuri,
    isVeg: true,
  },
  {
    id: "12",
    name: "Tea",
    description: "Fresh brewed tea with milk, a classic refreshing beverage",
    price: 15,
    category: "beverages",
    image: masalaChaiNew,
    isVeg: true,
  },
  {
    id: "26",
    name: "Coffee",
    description: "Hot brewed coffee with milk, rich and aromatic",
    price: 20,
    category: "beverages",
    image: hotCoffee,
    isVeg: true,
  },
  {
    id: "13",
    name: "Cold Coffee",
    description: "Refreshing iced coffee blended with milk and cream",
    price: 50,
    category: "beverages",
    image: coldCoffee,
    isVeg: true,
  },
  {
    id: "14",
    name: "Fresh Lime Soda",
    description: "Tangy lime with soda, choice of sweet or salted",
    price: 35,
    category: "beverages",
    image: limeSoda,
    isVeg: true,
  },
  {
    id: "21",
    name: "Buttermilk",
    description: "Refreshing spiced buttermilk with cumin and mint, cooling digestive drink",
    price: 25,
    category: "beverages",
    image: buttermilk,
    isVeg: true,
  },
  {
    id: "15",
    name: "Gulab Jamun (2 pcs)",
    description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
    price: 40,
    category: "desserts",
    image: gulabJamun,
    isVeg: true,
  },
  {
    id: "16",
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce and nuts",
    price: 60,
    category: "desserts",
    image: iceCreamSundae,
    isVeg: true,
  },
  // Soups
  {
    id: "22",
    name: "Manchow Soup",
    description: "Spicy Indo-Chinese soup with crispy fried noodles on top",
    price: 60,
    category: "soups",
    image: manchowSoup,
    isVeg: true,
  },
  // Maggi
  {
    id: "23",
    name: "Plain Maggi",
    description: "Classic Maggi noodles with original masala seasoning",
    price: 50,
    category: "maggi",
    image: plainMaggi,
    isVeg: true,
  },
  {
    id: "24",
    name: "Veg Maggi",
    description: "Maggi noodles loaded with fresh vegetables",
    price: 60,
    category: "maggi",
    image: vegMaggi,
    isVeg: true,
  },
  {
    id: "25",
    name: "Cheese Maggi",
    description: "Maggi noodles topped with melted cheese",
    price: 70,
    category: "maggi",
    image: cheeseMaggi,
    isVeg: true,
  },
];
