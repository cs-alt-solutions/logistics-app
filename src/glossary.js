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
      CARD_TRANSFER: 'CARD_TRANSFER' 
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
  commonUnits: ["Each", "Case", "6-Pack", "12-Pack", "Gallon", "Bulk Bag"],
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
      zones: [
        { id: 'zone-cooler-1', name: 'Cooler 1 (Sodas)', item_ids: ['item-drpepper', 'item-sprite', 'item-coke'] },
        { id: 'zone-cooler-2', name: 'Cooler 2 (Teas & Juice)', item_ids: ['item-sweettea', 'item-lemonade'] },
        { id: 'zone-cooler-3', name: 'Cooler 3 (Energy & Water)', item_ids: ['item-redbull', 'item-water'] },
        { id: 'zone-cooler-4', name: 'Cooler 4 (Dairy & Misc)', item_ids: ['item-creamer-vanilla', 'item-milk'] },
        { id: 'zone-shelf-1', name: 'Shelf 1 (Snacks)', item_ids: ['item-chips', 'item-pretzels'] },
        { id: 'zone-shelf-2', name: 'Shelf 2 (Dry Goods)', item_ids: [] },
        { id: 'zone-deli', name: 'Deli / Sandwiches', item_ids: ['item-sourdough', 'item-deli-cont', 'item-turkey'] }
      ]
    },
    restaurant: { 
      id: 'loc-restaurant', name: "The Restaurant", icon: Utensils,
      theme: { text: "text-amber-400", bg: "bg-amber-500", bgLight: "bg-amber-950/40", border: "border-amber-500/50", textHover: "group-hover:text-amber-400", glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" }
    }
  }
};

export const MASTER_CATALOG = [
  { id: 'item-wings', name: 'Chicken Wings', unit: 'Bulk Case', category: 'Meat', preferred_vendor: "Sam's Club", locations: ['loc-restaurant'], is_favorite: true },
  { id: 'item-bacon', name: 'Hickory Bacon', unit: '5lb Pack', category: 'Meat', preferred_vendor: "Restaurant Depot", locations: ['loc-restaurant'], is_favorite: false },
  { id: 'item-sourdough', name: 'Pre-Sliced Sourdough', unit: 'Loaf', category: 'Bread', preferred_vendor: "Walmart", locations: ['loc-bakery', 'loc-restaurant', 'loc-store'], is_favorite: true },
  { id: 'item-drpepper', name: 'Dr. Pepper 20oz', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], is_favorite: true },
  { id: 'item-sprite', name: 'Sprite 16.9oz', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], is_favorite: false },
  { id: 'item-coke', name: 'Coca-Cola 20oz', unit: '24-Pack Case', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false },
  { id: 'item-sweettea', name: 'Sweet Tea', unit: 'Gallon', category: 'Beverage', preferred_vendor: "Walmart", locations: ['loc-store', 'loc-restaurant'], is_favorite: true },
  { id: 'item-lemonade', name: 'Lemonade', unit: 'Gallon', category: 'Beverage', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false },
  { id: 'item-redbull', name: 'Red Bull 8.4oz', unit: '24-Pack', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false },
  { id: 'item-water', name: 'Bottled Water', unit: '40-Pack', category: 'Beverage', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: true },
  { id: 'item-creamer-vanilla', name: 'French Vanilla Creamer', unit: '50ct Box', category: 'Dairy', preferred_vendor: "Sam's Club", locations: ['loc-office', 'loc-store'], is_favorite: false },
  { id: 'item-milk', name: 'Whole Milk', unit: 'Gallon', category: 'Dairy', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false },
  { id: 'item-chips', name: 'Potato Chips (Assorted)', unit: 'Box', category: 'Snacks', preferred_vendor: "Sam's Club", locations: ['loc-store'], is_favorite: false },
  { id: 'item-pretzels', name: 'Pretzels', unit: 'Bag', category: 'Snacks', preferred_vendor: "Walmart", locations: ['loc-store'], is_favorite: false },
  { id: 'item-turkey', name: 'Sliced Turkey', unit: '2lb Pack', category: 'Meat', preferred_vendor: "Restaurant Depot", locations: ['loc-store'], is_favorite: false },
  { id: 'item-deli-cont', name: '8oz Clear Deli Containers', unit: '240ct Case', category: 'Supplies', preferred_vendor: "Restaurant Depot", locations: ['loc-restaurant', 'loc-bakery', 'loc-store'], is_favorite: false },
];