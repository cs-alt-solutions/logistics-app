import React, { useState, useMemo } from 'react';
import { Package, Truck, Store, Coffee, Utensils, ArrowLeft, Plus, Minus, ShoppingCart, ChevronRight, ShoppingBag, MapPin, CheckCircle, Briefcase, AlertTriangle, X, Send, Copy, ClipboardCheck, ArrowRightLeft, Lock, Ban, Edit2 } from 'lucide-react';

// ==========================================
// GLOSSARY & SINGLE SOURCE OF TRUTH 
// ==========================================
const GLOSSARY = {
  appTitle: "Alternative Logistics",
  security: {
    pin: "2026", // MVP Access PIN
    lockedMessage: "Authorized Personnel Only"
  },
  views: {
    builder: "Command Center",
    masterList: "Master Truck List",
    summary: "Delivery Report",
    tabs: {
      grocery: "Grocery List",
      delivery: "Delivery List"
    }
  },
  actions: {
    complete: "Finalize Deliveries",
    shareGrocery: "Share Morning Plan",
    shareOos: "Transmit OOS Alert",
    shareDelivery: "Share Pre-Flight Check",
    shareFinal: "Share Final Report"
  },
  vendors: [
    "Sam's Club",
    "Walmart",
    "Restaurant Depot",
    "Amazon", 
    "Local Supplier"
  ],
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

// ==========================================
// MASTER CATALOG (Sector-Mapped)
// ==========================================
const MASTER_CATALOG = [
  { id: 'item-wings', name: 'MM Chicken Wings', unit: 'Bulk Case', category: 'Meat', preferredVendor: "Sam's Club", locations: ['loc-restaurant'] },
  { id: 'item-bacon', name: 'Hickory Bacon', unit: '5lb Pack', category: 'Meat', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'] },
  { id: 'item-hoagie', name: '11" Hoagie Rolls', unit: '6-Pack Case', category: 'Bread', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'] },
  { id: 'item-sourdough', name: 'Farmhouse Sourdough', unit: 'Loaf', category: 'Bread', preferredVendor: "Walmart", locations: ['loc-bakery', 'loc-restaurant'] },
  { id: 'item-gorgonzola', name: 'Crumbled Gorgonzola', unit: '5lb Bag', category: 'Dairy', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'] },
  { id: 'item-ranch', name: 'ADM Ranch Dressing', unit: '1 Gallon Jug', category: 'Pantry', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'] },
  { id: 'item-bbq', name: 'Sweet Baby Rays BBQ', unit: '1 Gallon Jug', category: 'Pantry', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant'] },
  { id: 'item-drpepper', name: 'Dr. Pepper 20oz', unit: '24-Pack Case', category: 'Beverage', preferredVendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'] },
  { id: 'item-sprite', name: 'Sprite 16.9oz', unit: '24-Pack Case', category: 'Beverage', preferredVendor: "Sam's Club", locations: ['loc-store', 'loc-restaurant'] },
  { id: 'item-sweettea', name: 'Sweet Tea', unit: 'Gallon', category: 'Beverage', preferredVendor: "Walmart", locations: ['loc-store', 'loc-restaurant'] },
  { id: 'item-creamer-vanilla', name: 'French Vanilla Creamer', unit: '50ct Box', category: 'Dairy', preferredVendor: "Sam's Club", locations: ['loc-office', 'loc-store'] },
  { id: 'item-deli-cont', name: '8oz Clear Deli Containers', unit: '240ct Case', category: 'Supplies', preferredVendor: "Restaurant Depot", locations: ['loc-restaurant', 'loc-bakery'] },
  { id: 'item-sprinkles', name: 'Brownie Sprinkles', unit: 'Jar', category: 'Baking', preferredVendor: "Amazon", locations: ['loc-bakery'] },
  { id: 'item-flash-refills', name: 'Flash Mini Refills', unit: 'Pack', category: 'Supplies', preferredVendor: "Amazon", locations: ['loc-office'] },
];

// ==========================================
// MODULAR COMPONENTS
// ==========================================

// 0. Security Gatekeeper Component
const Gatekeeper = ({ onUnlock }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleKeyPress = (num) => {
    setError(false);
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        if (newInput === GLOSSARY.security.pin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setInput(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/20 to-zinc-950 pointer-events-none"></div>
      
      <div className="z-10 w-full max-w-xs flex flex-col items-center">
        <div className="bg-zinc-900 p-4 rounded-2xl mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-zinc-800">
          <Lock size={40} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <h1 className="text-2xl font-black tracking-widest mb-1 text-center text-zinc-100">{GLOSSARY.appTitle.toUpperCase()}</h1>
        <p className="text-cyan-500/70 text-sm font-semibold tracking-wide mb-10 uppercase">{GLOSSARY.security.lockedMessage}</p>

        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${error ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : input.length > i ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'bg-zinc-800 border border-zinc-700'}`}
            ></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              onClick={() => handleKeyPress(num.toString())}
              className="bg-zinc-900 hover:bg-zinc-800 text-2xl font-bold py-5 rounded-2xl transition-colors active:scale-95 border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/30"
            >
              {num}
            </button>
          ))}
          <div className="col-start-2">
            <button 
              onClick={() => handleKeyPress("0")}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-2xl font-bold py-5 rounded-2xl transition-colors active:scale-95 border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/30"
            >
              0
            </button>
          </div>
          <div className="col-start-3">
            <button 
              onClick={handleDelete}
              disabled={input.length === 0}
              className="w-full h-full flex items-center justify-center text-zinc-600 hover:text-rose-500 transition-colors active:scale-95"
            >
              <X size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1. Header Component
const AppHeader = ({ view, setView, totalItems }) => (
  <header className="bg-zinc-950 text-zinc-100 p-4 flex items-center justify-between border-b border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative z-20">
    <div className="flex items-center gap-3">
      {view !== 'builder' && (
        <button onClick={() => setView('builder')} className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-400 rounded transition-colors">
          <ArrowLeft size={20} />
        </button>
      )}
      <Truck size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      <h1 className="font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 uppercase">{GLOSSARY.appTitle}</h1>
    </div>
    
    {view !== 'master' && view !== 'summary' && (
      <button 
        onClick={() => setView('master')}
        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3 py-1.5 rounded-lg text-sm font-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
      >
        <ShoppingCart size={16} />
        <span>{totalItems}</span>
      </button>
    )}
  </header>
);

// 2. Location Card (Dashboard)
const LocationCard = ({ location, requestedCount, onClick }) => {
  const Icon = location.icon;
  return (
    <button 
      onClick={onClick}
      className="w-full bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex items-center justify-between mb-4 hover:border-cyan-400 transition-all text-left group shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
          <Icon size={28} className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        </div>
        <div>
          <h2 className="font-black text-zinc-100 text-lg tracking-wide">{location.name}</h2>
          <p className="text-sm text-zinc-500 font-semibold">
            {requestedCount > 0 ? (
              <span className="text-cyan-400 font-bold">{requestedCount} items queued</span>
            ) : (
              "Tap to initialize"
            )}
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-zinc-600 group-hover:text-cyan-400 relative z-10" />
    </button>
  );
};

// 3. Catalog Row (Order Builder)
const CatalogRow = ({ item, quantity, onAdd, onRemove, onEdit, activeTheme }) => (
  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-800 mb-3 flex items-center justify-between shadow-md transition-colors hover:border-zinc-700">
    <div className="flex-1 pr-2">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-zinc-100 leading-tight">{item.name}</h3>
        <button 
          onClick={onEdit} 
          className={`text-zinc-500 hover:${activeTheme.text} transition-colors bg-zinc-900/50 p-1 rounded-md`}
          title="Edit Item"
        >
          <Edit2 size={14} />
        </button>
      </div>
      <span className={`text-[11px] font-bold ${activeTheme.text} ${activeTheme.bgLight} ${activeTheme.border} border px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block`}>
        {item.unit}
      </span>
    </div>
    
    <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-1 border border-zinc-700 shadow-inner">
      <button 
        onClick={onRemove}
        disabled={quantity === 0}
        className={`p-2 rounded-lg transition-colors ${quantity > 0 ? `bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-rose-400 hover:border-rose-500/50` : 'text-zinc-600 cursor-not-allowed'}`}
      >
        <Minus size={18} />
      </button>
      <span className="w-6 text-center font-black text-lg text-zinc-100">
        {quantity}
      </span>
      <button 
        onClick={onAdd}
        className={`p-2 rounded-lg bg-zinc-800 ${activeTheme.text} border border-zinc-700 hover:${activeTheme.border} hover:${activeTheme.shadow} transition-all`}
      >
        <Plus size={18} />
      </button>
    </div>
  </div>
);

// 4. Edit Item Modal Component (Upgraded with Location Tagging)
const EditItemModal = ({ item, onSave, onClose }) => {
  // Ensure we default to an empty array if locations isn't set
  const [editedItem, setEditedItem] = useState({ ...item, locations: item.locations || [] });

  const toggleLocation = (locId) => {
    setEditedItem(prev => {
      const isSelected = prev.locations.includes(locId);
      if (isSelected) {
        return { ...prev, locations: prev.locations.filter(id => id !== locId) };
      } else {
        return { ...prev, locations: [...prev.locations, locId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedItem.name.trim() || editedItem.locations.length === 0) return;
    onSave(editedItem);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <Edit2 size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h2 className="font-black text-xl text-zinc-100 tracking-tight uppercase">Edit Catalog Item</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Item Name</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" 
              value={editedItem.name} 
              onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Unit of Measure</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" 
              value={editedItem.unit} 
              onChange={(e) => setEditedItem({ ...editedItem, unit: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Primary Vendor</label>
            <select 
              className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" 
              value={editedItem.preferredVendor} 
              onChange={(e) => setEditedItem({ ...editedItem, preferredVendor: e.target.value })}
            >
              <option value="">Select Primary Vendor...</option>
              {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* DYNAMIC SECTOR TAGGING */}
          <div className="pt-2">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1 mb-2 block">Target Sectors (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(GLOSSARY.locations).map(loc => {
                const isSelected = editedItem.locations.includes(loc.id);
                return (
                  <button
                    type="button"
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? `${loc.theme.bgLight} ${loc.theme.border} ${loc.theme.text} shadow-inner` : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}
                  >
                    {loc.name}
                  </button>
                );
              })}
            </div>
            {editedItem.locations.length === 0 && (
              <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">At least one sector is required.</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">
              ABORT
            </button>
            <button type="submit" disabled={!editedItem.name.trim() || editedItem.locations.length === 0} className="flex-1 py-3 rounded-xl font-black text-zinc-950 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:shadow-none">
              UPDATE ITEM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Shortage Allocator Modal (Exec Override)
const ShortageAllocatorModal = ({ itemId, catalog, orders, onResolve, onCancel }) => {
  const itemData = catalog.find(i => i.id === itemId);
  const locationsWithItem = Object.keys(orders).filter(locId => orders[locId][itemId] > 0);

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-2 text-rose-500">
          <AlertTriangle size={24} className="drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          <h2 className="font-black text-xl text-zinc-100 tracking-tight">Shortage Detected</h2>
        </div>
        <p className="text-zinc-400 mb-6 text-sm font-medium">
          Conflict for <span className="font-bold text-zinc-100">{itemData.name}</span>. Where should we extract <span className="font-black text-rose-500 text-base drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]">1</span> unit from?
        </p>

        <div className="space-y-3 mb-6">
          {locationsWithItem.map(locId => {
            const locInfo = Object.values(GLOSSARY.locations).find(l => l.id === locId);
            const currentQty = orders[locId][itemId];
            const Icon = locInfo.icon;
            const theme = locInfo.theme;

            return (
              <button
                key={locId}
                onClick={() => onResolve(locId, itemId)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border border-zinc-700 bg-zinc-800 hover:border-rose-500 hover:bg-rose-950/30 transition-all group text-left`}
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-zinc-900 border border-zinc-700 p-2 rounded-lg text-zinc-400 group-hover:${theme.text} transition-colors`}>
                    <Icon size={20} className={`group-hover:${theme.glow}`} />
                  </div>
                  <span className="font-bold text-zinc-200 group-hover:text-rose-100">{locInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Current:</span>
                  <span className="font-black text-lg bg-zinc-900 border border-zinc-700 px-3 py-0.5 rounded-lg text-zinc-300 group-hover:text-rose-400">
                    {currentQty}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={onCancel} className="w-full py-3.5 rounded-xl font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">
          Abort Extraction
        </button>
      </div>
    </div>
  );
};

// 6. Reallocation Modal (Mid-Route Adjustments)
const ItemReallocationModal = ({ itemId, catalog, orders, onUpdateQuantity, onClose }) => {
  const itemData = catalog.find(i => i.id === itemId);
  
  const [maxTotal] = useState(() => 
    Object.keys(orders).reduce((sum, locId) => sum + (orders[locId][itemId] || 0), 0)
  );

  const currentTotal = Object.keys(orders).reduce((sum, locId) => sum + (orders[locId][itemId] || 0), 0);
  const unallocated = maxTotal - currentTotal;

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <ArrowRightLeft size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h2 className="font-black text-xl text-zinc-100 tracking-tight">Reallocate Item</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={unallocated > 0}
            className={`p-2 rounded-full transition-colors ${unallocated > 0 ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 bg-cyan-950/20 p-4 rounded-xl border border-cyan-900/50">
           <div className="flex items-center justify-between">
             <div>
               <p className="font-bold text-cyan-50">{itemData.name}</p>
               <p className="text-[10px] text-cyan-400 font-black uppercase tracking-wider mt-1">{itemData.unit}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-0.5">Total on Truck</p>
               <p className="font-black text-3xl text-cyan-400 leading-none drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">{maxTotal}</p>
             </div>
           </div>

           {unallocated > 0 && (
             <div className="bg-amber-500/10 border border-amber-500/50 text-amber-400 px-3 py-2 rounded-lg flex items-center justify-between animate-in fade-in zoom-in duration-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                 <AlertTriangle size={14} className="drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                 Unassigned Pool:
               </span>
               <span className="font-black text-xl drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">{unallocated}</span>
             </div>
           )}
        </div>

        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-1">
          {Object.values(GLOSSARY.locations).map(loc => {
            const currentQty = (orders[loc.id] && orders[loc.id][itemId]) || 0;
            const Icon = loc.icon;
            const theme = loc.theme;

            return (
              <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`bg-zinc-900 border border-zinc-700 p-2 rounded-lg ${currentQty > 0 ? theme.text : 'text-zinc-500'} transition-colors`}>
                    <Icon size={18} className={currentQty > 0 ? theme.glow : ''} />
                  </div>
                  <span className="font-bold text-zinc-200">{loc.name}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-700 shadow-inner">
                  <button 
                    onClick={() => onUpdateQuantity(loc.id, itemId, -1)}
                    disabled={currentQty === 0}
                    className={`p-1.5 rounded-md transition-colors ${currentQty > 0 ? `text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 border border-transparent hover:border-rose-500/30` : 'text-zinc-700'}`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`w-8 text-center font-black text-lg ${currentQty > 0 ? theme.text : 'text-zinc-100'}`}>
                    {currentQty}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(loc.id, itemId, 1)}
                    disabled={unallocated === 0}
                    className={`p-1.5 rounded-md transition-colors ${unallocated > 0 ? `text-zinc-400 hover:bg-zinc-800 hover:${theme.text} border border-transparent hover:${theme.border}` : 'text-zinc-700 opacity-50 cursor-not-allowed'}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onClose}
          disabled={unallocated > 0}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${unallocated > 0 ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed' : 'text-zinc-950 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}
        >
          {unallocated > 0 ? (
            <>Assign Remaining Items</>
          ) : (
            <>
              <CheckCircle size={20} />
              Commit Reallocation
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// 7. Universal Chronological Manifest Generator Modal
const ShareManifestModal = ({ manifestType, orders, catalog, purchasedFrom, deliveredStatus, oosStatus, masterShoppingList, onClose }) => {
  const [copied, setCopied] = useState(false);

  const generateManifestText = () => {
    let text = "";
    let hasItems = false;

    const oosItems = Object.keys(masterShoppingList).filter(id => oosStatus[id]);

    if (manifestType === 'grocery') {
      text = "🛒 MORNING RUN PLAN\nTarget Shopping List:\n\n";
      
      [...GLOSSARY.vendors, "Unassigned"].forEach(vendorName => {
        const vendorItems = Object.entries(masterShoppingList).filter(([itemId]) => {
          const itemData = catalog.find(i => i.id === itemId);
          const currentVendor = purchasedFrom[itemId] || itemData?.preferredVendor || "Unassigned";
          return currentVendor === vendorName; 
        });

        if (vendorItems.length > 0) {
          hasItems = true;
          text += `🏢 ${vendorName.toUpperCase()}:\n`;
          vendorItems.forEach(([itemId, data]) => {
            const itemData = catalog.find(i => i.id === itemId);
            text += `  ▢ [ ${data.qty} ] ${itemData.name}\n`;
          });
          text += "\n";
        }
      });
      if (!hasItems) return "Shopping list is empty.";
      text += "⚠️ Reviewing this now. Reply if modifications are needed.";
    } 

    else if (manifestType === 'oos') {
      text = "🚨 URGENT: OUT OF STOCK\nI am currently shopping and cannot source the following target items:\n\n";
      
      if (oosItems.length > 0) {
        oosItems.forEach(itemId => {
          const itemData = catalog.find(i => i.id === itemId);
          text += `  ∅ ${itemData.name}\n`;
        });
        text += "\nACTION REQUIRED: Reply immediately. Do you want me to find alternatives or skip these today?";
      } else {
        return "Error: No items are currently marked Out of Stock.";
      }
    }
    
    else if (manifestType === 'delivery') {
      text = "🚚 TRUCK LOADED\nHeading to drop-offs. Current Fulfillment Plan:\n\n";
      Object.values(GLOSSARY.locations).forEach(loc => {
        const locOrders = orders[loc.id] || {};
        const activeItems = Object.keys(locOrders).filter(itemId => locOrders[itemId] > 0 && !oosStatus[itemId]);
        
        if (activeItems.length > 0) {
          hasItems = true;
          text += `📍 ${loc.name.toUpperCase()}:\n`;
          activeItems.forEach(itemId => {
            const itemData = catalog.find(i => i.id === itemId);
            text += `  📦 [ ${locOrders[itemId]} ] ${itemData.name}\n`;
          });
          text += "\n";
        }
      });
      if (!hasItems) return "Truck is currently empty.";
      text += "⚠️ Reply immediately if routing needs to change.";
    }

    else if (manifestType === 'final') {
      text = "✅ RUN COMPLETE\nOfficial Delivery Record:\n\n";
      Object.values(GLOSSARY.locations).forEach(loc => {
        const locOrders = orders[loc.id] || {};
        const deliveredItems = Object.keys(locOrders).filter(itemId => locOrders[itemId] > 0 && deliveredStatus[loc.id]?.[itemId] && !oosStatus[itemId]);
        
        if (deliveredItems.length > 0) {
          hasItems = true;
          text += `📍 ${loc.name.toUpperCase()}:\n`;
          deliveredItems.forEach(itemId => {
            const itemData = catalog.find(i => i.id === itemId);
            text += `  ✅ [ ${locOrders[itemId]} ] ${itemData.name}\n`;
          });
          text += "\n";
        }
      });
      if (!hasItems) text += "No items were marked as delivered.\n\n";

      if (oosItems.length > 0) {
        text += `❌ SKIPPED / OUT OF STOCK:\n`;
        oosItems.forEach(itemId => {
          const itemData = catalog.find(i => i.id === itemId);
          text += `  ∅ ${itemData.name}\n`;
        });
      }
    }

    return text;
  };

  const manifestText = generateManifestText();

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHeaderInfo = () => {
    switch(manifestType) {
      case 'grocery': return { title: "Morning Plan", icon: ClipboardCheck, color: "text-cyan-400" };
      case 'oos': return { title: "Shortage Alert", icon: AlertTriangle, color: "text-rose-500" };
      case 'delivery': return { title: "Pre-Flight Check", icon: Send, color: "text-cyan-400" };
      case 'final': return { title: "Final Report", icon: CheckCircle, color: "text-cyan-400" };
      default: return { title: "Manifest", icon: Send, color: "text-cyan-400" };
    }
  };

  const { title, icon: Icon, color } = getHeaderInfo();
  const isOosTheme = manifestType === 'oos';

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`bg-zinc-900 border ${isOosTheme ? 'border-rose-900/50 shadow-[0_0_40px_rgba(244,63,94,0.3)]' : 'border-zinc-700 shadow-[0_0_40px_rgba(0,0,0,0.8)]'} rounded-[2rem] p-6 w-full max-w-md animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center gap-3 ${color}`}>
            <Icon size={24} className={isOosTheme ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'} />
            <h2 className="font-black text-xl text-zinc-100 tracking-tight uppercase">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-zinc-500 mb-4 text-sm font-medium">
          Copy this payload to broadcast the exact routing data to the team.
        </p>

        <div className="bg-zinc-950 border border-zinc-800 shadow-inner rounded-xl p-4 overflow-y-auto flex-1 mb-4">
          <pre className="text-sm text-cyan-50/80 whitespace-pre-wrap font-mono font-medium leading-relaxed">
            {manifestText}
          </pre>
        </div>

        <button 
          onClick={handleCopy}
          className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md ${copied ? (isOosTheme ? 'bg-rose-500 text-zinc-950 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-cyan-500 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]') : 'bg-zinc-800 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:border-cyan-500/50'}`}
        >
          {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          {copied ? "PAYLOAD COPIED!" : "COPY MANIFEST"}
        </button>
      </div>
    </div>
  );
};


// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // START IN THE UNIFIED BUILDER VIEW
  const [view, setView] = useState('builder'); 
  const [activeLocKey, setActiveLocKey] = useState(Object.keys(GLOSSARY.locations)[0]); 
  const [masterTab, setMasterTab] = useState('grocery'); 
  
  const [catalog, setCatalog] = useState(MASTER_CATALOG);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  
  // NEW: Ensure default location array for the injection form includes the active sector
  const [newItem, setNewItem] = useState({ name: '', unit: '', preferredVendor: '', locations: [] });

  const [orders, setOrders] = useState({});
  const [deliveredStatus, setDeliveredStatus] = useState({});
  const [procuredStatus, setProcuredStatus] = useState({});
  const [purchasedFrom, setPurchasedFrom] = useState({});
  const [oosStatus, setOosStatus] = useState({});

  const [shortagePromptItem, setShortagePromptItem] = useState(null);
  const [manifestModalType, setManifestModalType] = useState(null); 
  const [reallocateItem, setReallocateItem] = useState(null);

  const toggleDelivery = (locId, itemId) => {
    setDeliveredStatus(prev => ({ ...prev, [locId]: { ...(prev[locId] || {}), [itemId]: !(prev[locId]?.[itemId]) } }));
  };

  const toggleProcured = (itemId) => {
    setProcuredStatus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleOOS = (itemId) => {
    setOosStatus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const updateQuantity = (locId, itemId, delta) => {
    setOrders(prev => {
      const currentLocOrders = prev[locId] || {};
      const currentQty = currentLocOrders[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [locId]: { ...currentLocOrders, [itemId]: newQty } };
    });
  };

  const handleDecreaseGlobalQty = (itemId) => {
    const locationsWithItem = Object.keys(orders).filter(locId => orders[locId][itemId] > 0);
    if (locationsWithItem.length > 1) {
      setShortagePromptItem(itemId);
    } else if (locationsWithItem.length === 1) {
      updateQuantity(locationsWithItem[0], itemId, -1);
    }
  };

  const handleIncreaseGlobalQty = (itemId) => {
    setOrders(prev => {
      const newOrders = JSON.parse(JSON.stringify(prev));
      let applied = false;
      for (const locId of Object.keys(newOrders)) {
        if (newOrders[locId] && newOrders[locId][itemId] > 0) {
          newOrders[locId][itemId] += 1;
          applied = true;
          break;
        }
      }
      if (!applied) {
        const fallbackLoc = GLOSSARY.locations.office.id;
        if (!newOrders[fallbackLoc]) newOrders[fallbackLoc] = {};
        newOrders[fallbackLoc][itemId] = (newOrders[fallbackLoc][itemId] || 0) + 1;
      }
      return newOrders;
    });
  };

  const resolveShortage = (locId, itemId) => {
    updateQuantity(locId, itemId, -1);
    setShortagePromptItem(null);
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || newItem.locations.length === 0) return;
    const newItemId = `item-${Date.now()}`;
    setCatalog(prev => [...prev, { 
      id: newItemId, name: newItem.name.trim(), unit: newItem.unit.trim() || 'Each', 
      category: 'Custom', preferredVendor: newItem.preferredVendor || "Local Supplier",
      locations: newItem.locations // Save the multi-sector tags!
    }]);
    setNewItem({ name: '', unit: '', preferredVendor: '', locations: [] });
    setShowAddItemForm(false);
  };

  const handleUpdateItem = (updatedItem) => {
    setCatalog(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
  };

  const totalMasterItems = useMemo(() => {
    let total = 0;
    Object.values(orders).forEach(locOrder => { Object.values(locOrder).forEach(qty => { total += qty; }); });
    return total;
  }, [orders]);

  const masterShoppingList = useMemo(() => {
    const list = {};
    Object.entries(orders).forEach(([locId, locItems]) => {
      Object.entries(locItems).forEach(([itemId, qty]) => {
        if (qty > 0) {
          if (!list[itemId]) list[itemId] = { qty: 0, locations: [] };
          list[itemId].qty += qty;
          list[itemId].locations.push({ name: GLOSSARY.locations[Object.keys(GLOSSARY.locations).find(key => GLOSSARY.locations[key].id === locId)].name, qty });
        }
      });
    });
    return list;
  }, [orders]);

  const hasOosItems = Object.keys(masterShoppingList).some(id => oosStatus[id]);
  const activeLocation = GLOSSARY.locations[activeLocKey];

  if (!isAuthenticated) {
    return <Gatekeeper onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans md:py-8 relative selection:bg-cyan-500/30">
      <div className="max-w-md mx-auto bg-zinc-900 md:rounded-[2rem] md:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-x md:border-y border-zinc-800 min-h-screen md:min-h-[850px] flex flex-col relative">
        <AppHeader view={view} setView={setView} totalItems={totalMasterItems} />

        {/* UNIFIED STICKY TABS */}
        {view === 'builder' && (
          <div className="flex overflow-x-auto snap-x scrollbar-hide gap-2 px-3 py-3 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10 shadow-lg">
            {Object.entries(GLOSSARY.locations).map(([key, loc]) => {
              const isActive = activeLocKey === key;
              const Icon = loc.icon;
              const theme = loc.theme;
              const locQty = Object.values(orders[loc.id] || {}).reduce((a, b) => a + b, 0);
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveLocKey(key)}
                  className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${isActive ? `${theme.bgLight} ${theme.border} ${theme.text} ${theme.shadow}` : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}
                >
                  <Icon size={14} className={isActive ? theme.glow : ''} />
                  {loc.name}
                  {locQty > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? `${theme.bg} text-zinc-950` : 'bg-zinc-800 text-zinc-400'}`}>
                      {locQty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">

          {/* VIEW: UNIFIED LOCATION ORDER BUILDER */}
          {view === 'builder' && activeLocation && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4">
                <h2 className="text-xl font-black text-zinc-400 tracking-tight uppercase flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${activeLocation.theme.bg} ${activeLocation.theme.glow}`}></span>
                  Active Matrix: <span className={activeLocation.theme.text}>{activeLocation.name}</span>
                </h2>
              </div>

              <div className="space-y-1">
                {catalog
                  .filter(item => item.locations && item.locations.includes(activeLocation.id))
                  .map(item => (
                  <CatalogRow 
                    key={item.id} item={item} quantity={(orders[activeLocation.id] || {})[item.id] || 0}
                    activeTheme={activeLocation.theme}
                    onAdd={() => updateQuantity(activeLocation.id, item.id, 1)}
                    onRemove={() => updateQuantity(activeLocation.id, item.id, -1)}
                    onEdit={() => setEditingItem(item)}
                  />
                ))}

                {showAddItemForm ? (
                  <form onSubmit={handleAddNewItem} className={`p-4 rounded-2xl border ${activeLocation.theme.border} bg-zinc-900 mt-4 ${activeLocation.theme.shadow} animate-in fade-in slide-in-from-top-2`}>
                    <h3 className={`font-black ${activeLocation.theme.text} mb-4 text-sm uppercase tracking-widest`}>Inject Custom Item</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Item Name (e.g., Paper Towels)" className={`w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-${activeLocation.theme.text.split('-')[1]}-500 font-bold text-zinc-100 placeholder:text-zinc-600 placeholder:font-normal transition-shadow shadow-inner`} value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                      <input type="text" placeholder="Unit (e.g., 12-Roll Pack, Each)" className={`w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-${activeLocation.theme.text.split('-')[1]}-500 font-bold text-zinc-100 placeholder:text-zinc-600 placeholder:font-normal transition-shadow shadow-inner`} value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
                      <select className={`w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-${activeLocation.theme.text.split('-')[1]}-500 font-bold text-zinc-300 transition-shadow shadow-inner`} value={newItem.preferredVendor} onChange={(e) => setNewItem({ ...newItem, preferredVendor: e.target.value })}>
                        <option value="">Select Primary Vendor...</option>
                        {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      
                      {/* INJECTION SECTOR TAGGING */}
                      <div className="pt-2">
                        <label className={`text-[10px] font-black ${activeLocation.theme.text} uppercase tracking-widest ml-1 mb-2 block`}>Target Sectors (Select Multiple)</label>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(GLOSSARY.locations).map(loc => {
                            const isSelected = newItem.locations.includes(loc.id);
                            return (
                              <button
                                type="button"
                                key={loc.id}
                                onClick={() => {
                                  setNewItem(prev => {
                                    if (prev.locations.includes(loc.id)) {
                                      return { ...prev, locations: prev.locations.filter(id => id !== loc.id) };
                                    } else {
                                      return { ...prev, locations: [...prev.locations, loc.id] };
                                    }
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? `${loc.theme.bgLight} ${loc.theme.border} ${loc.theme.text} shadow-inner` : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}
                              >
                                {loc.name}
                              </button>
                            );
                          })}
                        </div>
                        {newItem.locations.length === 0 && (
                          <p className="text-[10px] font-bold text-rose-500 mt-2 ml-1">At least one sector is required.</p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-zinc-800 mt-3">
                        <button type="button" onClick={() => setShowAddItemForm(false)} className="flex-1 py-3 rounded-xl font-black text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">ABORT</button>
                        <button type="submit" disabled={!newItem.name.trim() || newItem.locations.length === 0} className={`flex-1 py-3 rounded-xl font-black text-zinc-950 ${activeLocation.theme.bg} disabled:bg-zinc-700 disabled:text-zinc-500 transition-all ${activeLocation.theme.shadow} disabled:shadow-none`}>INJECT</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => {
                    // Default the locations array to the currently active sector when opening the form!
                    setNewItem({ name: '', unit: '', preferredVendor: '', locations: [activeLocation.id] });
                    setShowAddItemForm(true);
                  }} className={`w-full mt-4 p-4 rounded-2xl border border-dashed border-zinc-700 text-zinc-500 font-black flex items-center justify-center gap-2 hover:bg-zinc-800 ${activeLocation.theme.borderHover} ${activeLocation.theme.textHover} transition-all uppercase tracking-wider`}>
                    <Plus size={20} /> Inject Custom Item
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW: MASTER TRUCK LIST */}
          {view === 'master' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="mb-6 mt-2">
                <h2 className="text-3xl font-black text-zinc-100 tracking-tight uppercase">{GLOSSARY.views.masterList}</h2>
                <p className="text-zinc-500 mt-1 font-semibold uppercase tracking-wider text-xs">Procurement & Routing</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-zinc-950 p-1.5 rounded-xl mb-6 shadow-inner border border-zinc-800 relative z-0">
                <button onClick={() => setMasterTab('grocery')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-sm uppercase tracking-wider transition-all z-10 ${masterTab === 'grocery' ? 'bg-zinc-800 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <ShoppingBag size={18} /> {GLOSSARY.views.tabs.grocery}
                </button>
                <button onClick={() => setMasterTab('delivery')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-sm uppercase tracking-wider transition-all z-10 ${masterTab === 'delivery' ? 'bg-zinc-800 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <MapPin size={18} /> {GLOSSARY.views.tabs.delivery}
                </button>
              </div>

              {Object.keys(masterShoppingList).length === 0 ? (
                <div className="text-center p-10 bg-zinc-900 rounded-2xl border border-dashed border-zinc-700 mt-10">
                  <ShoppingCart size={48} className="mx-auto text-zinc-700 mb-4" />
                  <h3 className="text-zinc-400 font-black uppercase tracking-widest">Payload Empty</h3>
                  <p className="text-zinc-600 text-sm mt-2 font-medium">Inject items via sector menus.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* GROCERY LIST TAB (Procurement) */}
                  {masterTab === 'grocery' && (
                    <div className="space-y-8">
                      {/* DYNAMIC ACTION BAR (Changes based on OOS status) */}
                      {hasOosItems ? (
                         <div className="bg-rose-950/40 border border-rose-900/50 rounded-2xl p-4 flex items-center justify-between shadow-inner -mt-2 mb-4 animate-in fade-in">
                           <div>
                             <h3 className="font-black text-rose-400 text-sm uppercase tracking-wide">Shortages Logged</h3>
                             <p className="text-xs text-rose-500/80 mt-0.5 font-semibold">Alert the team immediately.</p>
                           </div>
                           <button 
                             onClick={() => setManifestModalType('oos')}
                             className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 border border-rose-400 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                           >
                             <AlertTriangle size={16} />
                             {GLOSSARY.actions.shareOos}
                           </button>
                         </div>
                      ) : (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-inner -mt-2 mb-4">
                          <div>
                            <h3 className="font-black text-zinc-300 text-sm uppercase tracking-wide">Briefing Complete?</h3>
                            <p className="text-xs text-zinc-500 mt-0.5 font-semibold">Transmit procurement vectors.</p>
                          </div>
                          <button 
                            onClick={() => setManifestModalType('grocery')}
                            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-cyan-400 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                          >
                            <ClipboardCheck size={16} />
                            Share Plan
                          </button>
                        </div>
                      )}

                      {[...GLOSSARY.vendors, "Unassigned"].map(vendorName => {
                        const vendorItems = Object.entries(masterShoppingList).filter(([itemId]) => {
                          const itemData = catalog.find(i => i.id === itemId);
                          const currentVendor = purchasedFrom[itemId] || itemData?.preferredVendor || "Unassigned";
                          return currentVendor === vendorName;
                        });

                        if (vendorItems.length === 0) return null;

                        return (
                          <div key={vendorName} className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3 ml-1">
                              <Store size={18} className="text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                              <h3 className="font-black text-sm text-zinc-300 uppercase tracking-widest">{vendorName}</h3>
                              <span className="bg-zinc-950 border border-zinc-800 text-zinc-500 text-xs font-black px-2.5 py-0.5 rounded-md ml-auto shadow-inner">{vendorItems.length}</span>
                            </div>
                            
                            {vendorItems.map(([itemId, data]) => {
                              const itemData = catalog.find(i => i.id === itemId);
                              const currentVendor = purchasedFrom[itemId] || itemData.preferredVendor || "Unassigned";
                              const isProcured = procuredStatus[itemId];
                              const isOos = oosStatus[itemId];
                              
                              return (
                                <div key={itemId} className={`bg-zinc-800 p-4 rounded-2xl shadow-md border flex flex-col gap-3 transition-all duration-300 ${isOos ? 'border-rose-500/50 bg-rose-950/20' : isProcured ? 'border-cyan-900/50 bg-cyan-950/20' : 'border-zinc-700'}`}>
                                  <div className="flex items-center justify-between">
                                    <button 
                                      onClick={() => !isOos && toggleProcured(itemId)} 
                                      disabled={isOos}
                                      className={`flex items-center gap-4 text-left flex-1 group ${isOos ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isProcured ? 'bg-cyan-500 border-cyan-400 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-zinc-600 bg-zinc-900 group-hover:border-cyan-500/50'}`}>
                                        {isProcured && <CheckCircle size={18} />}
                                      </div>
                                      <div>
                                        <h3 className={`font-bold text-xl transition-colors ${isOos ? 'text-rose-400 line-through' : isProcured ? 'text-zinc-600 line-through' : 'text-zinc-100 group-hover:text-cyan-50'}`}>{itemData.name}</h3>
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded mt-1 inline-block shadow-inner">{itemData.unit}</span>
                                      </div>
                                    </button>
                                    
                                    <div className={`flex flex-col items-center p-1 rounded-xl shadow-inner border transition-colors shrink-0 z-0 ${isOos ? 'bg-rose-950/50 border-rose-900/50 opacity-50' : isProcured ? 'bg-cyan-950/40 border-cyan-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
                                      <button onClick={() => !isOos && handleIncreaseGlobalQty(itemId)} disabled={isOos} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-cyan-400 transition-colors"><Plus size={16} /></button>
                                      <div className={`font-black text-xl w-10 flex items-center justify-center transition-colors ${isOos ? 'text-rose-500' : isProcured ? 'text-cyan-600' : 'text-zinc-200'}`}>{data.qty}</div>
                                      <button onClick={() => !isOos && handleDecreaseGlobalQty(itemId)} disabled={isOos} className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-rose-500 transition-colors"><Minus size={16} /></button>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-3 border-t border-zinc-700/50 flex items-center justify-between">
                                    <button 
                                      onClick={() => toggleOOS(itemId)}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isOos ? 'bg-rose-500 text-zinc-950 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-rose-400 hover:border-rose-900/50'}`}
                                    >
                                      <Ban size={14} />
                                      {isOos ? 'Marked OOS' : 'Mark OOS'}
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                      <select disabled={isOos} className={`text-xs bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner ${isOos ? 'opacity-50 cursor-not-allowed' : ''}`} value={currentVendor} onChange={(e) => setPurchasedFrom(prev => ({...prev, [itemId]: e.target.value}))}>
                                        <option value="Unassigned" disabled>Select Vector...</option>
                                        {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* DELIVERY LIST TAB (Fulfillment grouped by Location) */}
                  {masterTab === 'delivery' && (
                    <>
                      {/* PRE-FLIGHT ACTION BAR */}
                      <div className="mb-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-inner -mt-2">
                        <div>
                          <h3 className="font-black text-zinc-300 text-sm uppercase tracking-wide">Procurement Secured?</h3>
                          <p className="text-xs text-zinc-500 mt-0.5 font-semibold">Transmit routing payload.</p>
                        </div>
                        <button 
                          onClick={() => setManifestModalType('delivery')}
                          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-cyan-400 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        >
                          <Send size={16} />
                          Transmit
                        </button>
                      </div>

                      {Object.values(GLOSSARY.locations).map(loc => {
                        const locOrders = orders[loc.id] || {};
                        // Filter out items completely so they don't show up on delivery if they are OOS
                        const activeItems = Object.keys(locOrders).filter(itemId => locOrders[itemId] > 0 && !oosStatus[itemId]);
                        
                        if (activeItems.length === 0) return null;

                        const theme = loc.theme;

                        return (
                          <div key={loc.id} className={`mb-6 bg-zinc-800 rounded-2xl shadow-md border ${theme.border} overflow-hidden`}>
                            <div className={`${theme.bgLight} px-4 py-3 border-b ${theme.border} flex items-center gap-3`}>
                              <loc.icon size={18} className={`${theme.text} ${theme.glow}`} />
                              <h3 className={`font-black ${theme.text} uppercase tracking-widest text-sm`}>{loc.name}</h3>
                            </div>
                            <div className="p-2">
                              {activeItems.map((itemId) => {
                                const qty = locOrders[itemId];
                                const itemData = catalog.find(i => i.id === itemId);
                                const isDelivered = deliveredStatus[loc.id]?.[itemId];
                                
                                return (
                                  <div key={itemId} className={`w-full flex items-center p-2 border-b border-zinc-700/30 last:border-0 transition-all ${isDelivered ? 'bg-zinc-900/50 opacity-50' : 'hover:bg-zinc-700/30'}`}>
                                    
                                    {/* Left Side: Checkbox strictly for marking Delivered */}
                                    <button 
                                      onClick={() => toggleDelivery(loc.id, itemId)}
                                      className="p-2 shrink-0 group"
                                    >
                                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isDelivered ? `${theme.bg} ${theme.border} text-zinc-950 ${theme.shadow}` : 'border-zinc-600 bg-zinc-900 group-hover:border-zinc-500'}`}>
                                        {isDelivered && <CheckCircle size={16} />}
                                      </div>
                                    </button>

                                    {/* Middle & Right Side: Opens Reallocation Modal */}
                                    <button 
                                      onClick={() => setReallocateItem(itemId)}
                                      className="flex-1 flex justify-between items-center pl-2 text-left group"
                                    >
                                      <span className={`font-bold ${isDelivered ? 'text-zinc-600 line-through' : `text-zinc-200 ${theme.textHover}`}`}>
                                        {itemData.name}
                                      </span>
                                      
                                      <div className={`font-black text-lg px-3 py-1 rounded-lg flex items-center gap-2 transition-all ${isDelivered ? 'text-zinc-600 bg-zinc-950 border border-zinc-800' : `${theme.text} ${theme.bgLight} border ${theme.border} ${theme.borderHover} ${theme.shadow}`}`}>
                                        {qty}x
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={() => setView('summary')}
                        className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle size={20} />
                        {GLOSSARY.actions.complete}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SUMMARY REPORT */}
          {view === 'summary' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6 mt-2 text-center">
                <div className="w-16 h-16 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <CheckCircle size={32} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </div>
                <h2 className="text-3xl font-black text-zinc-100 tracking-tight uppercase">{GLOSSARY.views.summary}</h2>
                <p className="text-zinc-500 mt-1 font-semibold text-xs uppercase tracking-widest">Routing Successfully Terminated</p>
              </div>

              <div className="bg-zinc-800 p-5 rounded-2xl shadow-md border border-zinc-700 mb-6">
                {Object.values(GLOSSARY.locations).map(loc => {
                  const locOrders = orders[loc.id] || {};
                  const deliveredForLoc = Object.keys(locOrders).filter(itemId => locOrders[itemId] > 0 && deliveredStatus[loc.id]?.[itemId] && !oosStatus[itemId]);
                  
                  if (deliveredForLoc.length === 0) return null;

                  const theme = loc.theme;

                  return (
                    <div key={loc.id} className="mb-5 last:mb-0">
                      <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${theme.border}`}>
                        <MapPin size={16} className={theme.text} />
                        <h4 className={`font-black ${theme.text} uppercase tracking-wider text-sm`}>{loc.name}</h4>
                      </div>
                      <div className={`pl-6 space-y-1.5 border-l-2 ${theme.border} ml-2 mt-2`}>
                        {deliveredForLoc.map(itemId => {
                          const itemData = catalog.find(i => i.id === itemId);
                          return (
                            <div key={itemId} className="text-sm text-zinc-400 flex justify-between items-center">
                              <span className="font-medium">{itemData.name}</span>
                              <span className={`font-black ${theme.text} ${theme.bgLight} border ${theme.border} px-2 py-0.5 rounded`}>{locOrders[itemId]}x</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Show Skipped/OOS Items at the bottom of the final report */}
                {Object.keys(masterShoppingList).filter(id => oosStatus[id]).length > 0 && (
                   <div className="mt-6 pt-4 border-t-2 border-zinc-700/50">
                     <div className="flex items-center gap-2 mb-3">
                        <Ban size={16} className="text-rose-500" />
                        <h4 className="font-black text-rose-400 uppercase tracking-wider text-sm">Skipped / Out of Stock</h4>
                     </div>
                     <div className="pl-6 space-y-1.5 border-l-2 border-rose-900/50 ml-2">
                       {Object.keys(masterShoppingList).filter(id => oosStatus[id]).map(itemId => {
                          const itemData = catalog.find(i => i.id === itemId);
                          return (
                            <div key={itemId} className="text-sm text-zinc-500 flex justify-between items-center">
                              <span className="font-medium line-through decoration-rose-500/50">{itemData.name}</span>
                              <span className="font-black text-rose-500 bg-rose-950/20 border border-rose-900/50 px-2 py-0.5 rounded">OOS</span>
                            </div>
                          );
                       })}
                     </div>
                   </div>
                )}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setManifestModalType('final')}
                  className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-cyan-500/50 text-cyan-400 font-black uppercase tracking-wider py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send size={20} />
                  Transmit Final Record
                </button>
                
                <button 
                  onClick={() => {
                    setOrders({});
                    setDeliveredStatus({});
                    setProcuredStatus({});
                    setPurchasedFrom({});
                    setOosStatus({}); 
                    setView('builder');
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:bg-rose-950/40 hover:border-rose-500/50 hover:text-rose-400 text-zinc-500 font-black uppercase tracking-wider py-4 rounded-xl shadow-inner flex items-center justify-center gap-2 transition-all"
                >
                  <Truck size={20} />
                  Initialize New Run
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Modal Portals */}
        {editingItem && (
          <EditItemModal 
            item={editingItem} 
            onSave={handleUpdateItem} 
            onClose={() => setEditingItem(null)} 
          />
        )}

        {shortagePromptItem && (
          <ShortageAllocatorModal 
            itemId={shortagePromptItem}
            catalog={catalog}
            orders={orders}
            onResolve={resolveShortage}
            onCancel={() => setShortagePromptItem(null)}
          />
        )}

        {reallocateItem && (
          <ItemReallocationModal 
            itemId={reallocateItem}
            catalog={catalog}
            orders={orders}
            onUpdateQuantity={updateQuantity}
            onClose={() => setReallocateItem(null)}
          />
        )}

        {manifestModalType && (
          <ShareManifestModal 
            manifestType={manifestModalType}
            orders={orders}
            catalog={catalog}
            purchasedFrom={purchasedFrom}
            deliveredStatus={deliveredStatus}
            oosStatus={oosStatus} 
            masterShoppingList={masterShoppingList}
            onClose={() => setManifestModalType(null)}
          />
        )}

      </div>
    </div>
  );
}