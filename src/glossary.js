import { Briefcase, Coffee, Store, Utensils, Shield, Navigation } from 'lucide-react';

export const GLOSSARY = {
  appTitle: "Alternative Logistics",
  security: {
    pin: "2026", 
    lockedMessage: "Authorized Personnel Only",
    roles: {
      admin: { id: 'admin', name: 'Admin Command', icon: Shield },
      driver: { id: 'driver', name: 'Driver Console', icon: Navigation }
    }
  },
  system: {
    phases: {
      IDLE: 'IDLE',
      DRIVER_CLOCK_IN: 'CLOCK_IN',
      PLANNING: 'PLANNING',
      SHOPPING: 'SHOPPING',
      DELIVERING: 'DELIVERING'
    },
    itemStatus: {
      PENDING: 'PENDING',
      PROCURED: 'PROCURED',
      DELIVERED: 'DELIVERED',
      SKIPPED: 'SKIPPED',
      CARD_TRANSFER: 'CARD_TRANSFER',
      DISMISSED: 'DISMISSED',
      ROLLED_OVER: 'ROLLED_OVER' 
    }
  },
  vendors: [
    "Sam's Club",
    "Walmart",
    "Restaurant Depot",
    "Amazon", 
    "Local Supplier"
  ],
  defaultVendor: "Walmart",
  categories: [
    "Beverage",
    "Bread",
    "Condiments",
    "Dairy",
    "Meat",
    "Produce",
    "Snacks",
    "Supplies",
    "Uncategorized"
  ],
  units: [
    "Each", "Case", "6-Pack", "12-Pack", "24-Pack Case", "40-Pack", "Gallon", "Loaf", "Bag", "5lb Pack", "2lb Pack", "Bulk Bag", "Bulk Case"
  ],
  containerTypes: [
    "Plastic Bottle",
    "Glass Bottle",
    "Aluminum Can",
    "Cardboard Box",
    "Plastic Bag",
    "Paper Bag",
    "Foil Pouch",
    "Plastic Tub",
    "None"
  ],
  locations: {
    office: { 
      id: 'loc-office', name: "Office", icon: Briefcase,
      theme: { text: "text-emerald-400", bg: "bg-emerald-500", bgLight: "bg-emerald-950/40", border: "border-emerald-500/50", textHover: "group-hover:text-emerald-400", glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" }
    },
    bakery: { 
      id: 'loc-bakery', name: "Bakery", icon: Coffee,
      theme: { text: "text-fuchsia-400", bg: "bg-fuchsia-500", bgLight: "bg-fuchsia-950/40", border: "border-fuchsia-500/50", textHover: "group-hover:text-fuchsia-400", glow: "drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" }
    },
    store: { 
      id: 'loc-store', name: "Country Store", icon: Store,
      theme: { text: "text-blue-400", bg: "bg-blue-500", bgLight: "bg-blue-950/40", border: "border-blue-500/50", textHover: "group-hover:text-blue-400", glow: "drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" },
      strict_planogram: true, 
      zones: [] // Populated via database
    },
    restaurant: { 
      id: 'loc-restaurant', name: "The Restaurant", icon: Utensils,
      theme: { text: "text-amber-400", bg: "bg-amber-500", bgLight: "bg-amber-950/40", border: "border-amber-500/50", textHover: "group-hover:text-amber-400", glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" }
    }
  }
};

export const MASTER_CATALOG = [
  { id: 'item-wings', name: 'Chicken Wings', item_size: '', container_type: 'Cardboard Box', unit: 'Bulk Case', category: 'Meat', preferred_vendor: "Sam's Club", locations: ['loc-restaurant'], is_favorite: true, flavors: [] },
  { id: 'item-bacon', name: 'Hickory Bacon', item_size: '5 lb', container_type: 'Plastic Bag', unit: '5lb Pack', category: 'Meat', preferred_vendor: "Restaurant Depot", locations: ['loc-restaurant'], is_favorite: false, flavors: [] },
  { id: 'item-sourdough', name: 'Pre-Sliced Sourdough', item_size: '', container_type: 'Plastic Bag', unit: 'Loaf', category: 'Bread', preferred_vendor: "Walmart", locations: ['loc-bakery', 'loc-restaurant', 'loc-store'], is_favorite: true, flavors: [] },
  { id: 'item-drpepper', name: 'Dr. Pepper', item_size: '20 oz', container_type: 'Plastic Bottle', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], is_favorite: true, flavors: ['Regular', 'Diet', 'Cherry'] },
  { id: 'item-sprite', name: 'Sprite', item_size: '16.9 oz', container_type: 'Plastic Bottle', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], is_favorite: false, flavors: [] },
  { id: 'item-coke', name: 'Coca-Cola', item_size: '20 oz', container_type: 'Plastic Bottle', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false, flavors: ['Classic', 'Zero', 'Diet'] },
  { id: 'item-sweettea', name: 'Sweet Tea', item_size: '1 Gallon', container_type: 'Plastic Bottle', unit: 'Gallon', category: 'Beverage', preferred_vendor: "Walmart", locations: ['loc-store', 'loc-restaurant'], is_favorite: true, flavors: [] },
  { id: 'item-lemonade', name: 'Lemonade', item_size: '1 Gallon', container_type: 'Plastic Bottle', unit: 'Gallon', category: 'Beverage', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-redbull', name: 'Red Bull', item_size: '8.4 oz', container_type: 'Aluminum Can', unit: '24-Pack', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false, flavors: ['Original', 'Sugar Free'] },
  { id: 'item-water', name: 'Bottled Water', item_size: '16.9 oz', container_type: 'Plastic Bottle', unit: '40-Pack', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: true, flavors: [] },
  { id: 'item-creamer-vanilla', name: 'French Vanilla Creamer', item_size: '', container_type: 'Cardboard Box', unit: '50ct Box', category: 'Dairy', preferred_vendor: "Sam's Club", locations: ['loc-office', 'loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-milk', name: 'Whole Milk', item_size: '1 Gallon', container_type: 'Plastic Bottle', unit: 'Gallon', category: 'Dairy', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-chips', name: 'Potato Chips (Assorted)', item_size: '', container_type: 'Cardboard Box', unit: 'Box', category: 'Snacks', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-pretzels', name: 'Pretzels', item_size: '', container_type: 'Plastic Bag', unit: 'Bag', category: 'Snacks', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-turkey', name: 'Sliced Turkey', item_size: '2 lb', container_type: 'Plastic Bag', unit: '2lb Pack', category: 'Meat', preferred_vendor: "Restaurant Depot", locations: ['loc-store'], is_favorite: false, flavors: [] },
  { id: 'item-deli-cont', name: 'Clear Deli Containers', item_size: '8 oz', container_type: 'Cardboard Box', unit: '240ct Case', category: 'Supplies', preferred_vendor: "Restaurant Depot", locations: ['loc-restaurant', 'loc-bakery', 'loc-store'], is_favorite: false, flavors: [] },
];