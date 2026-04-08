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
      IDLE: 'IDLE', // Clocked out / Off Day
      DRIVER_CLOCK_IN: 'CLOCK_IN', // Driver is on the clock, no manifest yet
      PLANNING: 'PLANNING',
      SHOPPING: 'SHOPPING',
      DELIVERING: 'DELIVERING'
    },
    itemStatus: {
      PENDING: 'PENDING',
      PROCURED: 'PROCURED',
      DELIVERED: 'DELIVERED',
      SKIPPED: 'SKIPPED',
      CARD_TRANSFER: 'CARD_TRANSFER' // Special status for tracking the physical business card
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
      theme: { text: "text-emerald-400", bg: "bg-emerald-500", bgLight: "bg-emerald-950/40", border: "border-emerald-500/50", borderHover: "group-hover:border-emerald-500/50", textHover: "group-hover:text-emerald-400", glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]", shadow: "shadow-[0_0_10px_rgba(52,211,153,0.4)]" }
    },
    bakery: { 
      id: 'loc-bakery', name: "Bakery", icon: Coffee,
      theme: { text: "text-fuchsia-400", bg: "bg-fuchsia-500", bgLight: "bg-fuchsia-950/40", border: "border-fuchsia-500/50", borderHover: "group-hover:border-fuchsia-500/50", textHover: "group-hover:text-fuchsia-400", glow: "drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]", shadow: "shadow-[0_0_10px_rgba(232,121,249,0.4)]" }
    },
    store: { 
      id: 'loc-store', name: "Country Store", icon: Store,
      theme: { text: "text-blue-400", bg: "bg-blue-500", bgLight: "bg-blue-950/40", border: "border-blue-500/50", borderHover: "group-hover:border-blue-500/50", textHover: "group-hover:text-blue-400", glow: "drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]", shadow: "shadow-[0_0_10px_rgba(96,165,250,0.4)]" }
    },
    restaurant: { 
      id: 'loc-restaurant', name: "The Restaurant", icon: Utensils,
      theme: { text: "text-amber-400", bg: "bg-amber-500", bgLight: "bg-amber-950/40", border: "border-amber-500/50", borderHover: "group-hover:border-amber-500/50", textHover: "group-hover:text-amber-400", glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]", shadow: "shadow-[0_0_10px_rgba(251,191,36,0.4)]" }
    }
  }
};

export const MASTER_CATALOG = [
  { id: 'item-wings', name: 'Chicken Wings', unit: 'Bulk Case', category: 'Meat', preferredVendor: "Sam's Club", locations: ['loc-restaurant'], isFavorite: true },
  { id: 'item-bacon', name: 'Hickory Bacon', unit: '5lb Pack', category: 'Meat', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'], isFavorite: false },
  { id: 'item-hoagie', name: '11" Hoagie Rolls', unit: '6-Pack Case', category: 'Bread', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'], isFavorite: false },
  { id: 'item-sourdough', name: 'Pre-Sliced Sourdough', unit: 'Loaf', category: 'Bread', preferredVendor: "Walmart", locations: ['loc-bakery', 'loc-restaurant'], isFavorite: true },
  { id: 'item-gorgonzola', name: 'Crumbled Gorgonzola', unit: '5lb Bag', category: 'Dairy', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'], isFavorite: false },
  { id: 'item-ranch', name: 'Ranch Dressing', unit: '1 Gallon Jug', category: 'Pantry', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'], isFavorite: false },
  { id: 'item-bbq', name: 'BBQ Sauce', unit: '1 Gallon Jug', category: 'Pantry', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'], isFavorite: false },
  { id: 'item-drpepper', name: 'Dr. Pepper 20oz', unit: '24-Pack Case', category: 'Beverage', preferredVendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], isFavorite: true },
  { id: 'item-sprite', name: 'Sprite 16.9oz', unit: '24-Pack Case', category: 'Beverage', preferredVendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'], isFavorite: false },
  { id: 'item-sweettea', name: 'Sweet Tea', unit: 'Gallon', category: 'Beverage', preferredVendor: "Walmart", locations: ['loc-store', 'loc-restaurant'], isFavorite: true },
  { id: 'item-creamer-vanilla', name: 'French Vanilla Creamer', unit: '50ct Box', category: 'Dairy', preferredVendor: "Sam's Club", locations: ['loc-office', 'loc-store'], isFavorite: false },
  { id: 'item-deli-cont', name: '8oz Clear Deli Containers', unit: '240ct Case', category: 'Supplies', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant', 'loc-bakery'], isFavorite: false },
  { id: 'item-sprinkles', name: 'Chocolate Sprinkles', unit: 'Jar', category: 'Baking', preferredVendor: "Amazon", locations: ['loc-bakery'], isFavorite: false },
  { id: 'item-flash-refills', name: 'Mini Mini Marshmallows', unit: 'Pack', category: 'Supplies', preferredVendor: "Amazon", locations: ['loc-office'], isFavorite: false },
];