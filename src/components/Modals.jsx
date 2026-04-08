import React, { useState } from 'react';
import { Edit2, X, AlertTriangle, ArrowRightLeft, CheckCircle, ClipboardCheck, Send, Copy, Star } from 'lucide-react';
import { GLOSSARY } from '../glossary';

export const EditItemModal = ({ item, onSave, onClose }) => {
  const [editedItem, setEditedItem] = useState({ ...item, locations: item.locations || [], isFavorite: item.isFavorite || false });

  const toggleLocation = (locId) => {
    setEditedItem(prev => ({
      ...prev,
      locations: prev.locations.includes(locId) ? prev.locations.filter(id => id !== locId) : [...prev.locations, locId]
    }));
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
          <button onClick={onClose} className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Item Name</label>
            <button type="button" onClick={() => setEditedItem({...editedItem, isFavorite: !editedItem.isFavorite})} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${editedItem.isFavorite ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
              <Star size={12} className={editedItem.isFavorite ? 'fill-amber-400' : ''} /> {editedItem.isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
          <input type="text" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={editedItem.name} onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })} />
          
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Unit of Measure</label>
            <input type="text" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={editedItem.unit} onChange={(e) => setEditedItem({ ...editedItem, unit: e.target.value })} />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Primary Vendor</label>
            <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={editedItem.preferredVendor} onChange={(e) => setEditedItem({ ...editedItem, preferredVendor: e.target.value })}>
              <option value="">Select Primary Vendor...</option>
              {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1 mb-2 block">Target Sectors (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(GLOSSARY.locations).map(loc => (
                  <button type="button" key={loc.id} onClick={() => toggleLocation(loc.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${editedItem.locations.includes(loc.id) ? `${loc.theme.bgLight} ${loc.theme.border} ${loc.theme.text} shadow-inner` : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'}`}>
                    {loc.name}
                  </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">ABORT</button>
            <button type="submit" disabled={!editedItem.name.trim() || editedItem.locations.length === 0} className="flex-1 py-3 rounded-xl font-black text-zinc-950 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:shadow-none">UPDATE ITEM</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ShortageAllocatorModal = ({ itemId, catalog, orders, onResolve, onCancel }) => {
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

export const ItemReallocationModal = ({ itemId, catalog, orders, onUpdateQuantity, onClose }) => {
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
          <div className="flex items-center gap-3 text-fuchsia-400">
            <ArrowRightLeft size={24} className="drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
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

        <div className="mb-6 flex flex-col gap-3 bg-fuchsia-900/10 p-4 rounded-xl border border-fuchsia-500/20">
           <div className="flex items-center justify-between">
             <div>
               <p className="font-bold text-fuchsia-100">{itemData.name}</p>
               <p className="text-[10px] text-fuchsia-400 font-black uppercase tracking-wider mt-1">{itemData.unit}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-fuchsia-500 font-bold uppercase tracking-wider mb-0.5">Total on Truck</p>
               <p className="font-black text-3xl text-fuchsia-400 leading-none drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]">{maxTotal}</p>
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

export const ShareManifestModal = ({ manifestType, orders, catalog, purchasedFrom, deliveredStatus, oosStatus, masterShoppingList, deliveryStartTime, onClose }) => {
  const [copied, setCopied] = useState(false);

  const generateManifestText = () => {
    let text = "";
    let hasItems = false;
    const now = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    const oosItems = Object.keys(masterShoppingList).filter(id => oosStatus[id]);

    if (manifestType === 'grocery') {
      text = `🛒 MORNING RUN PLAN\nCreated: ${now}\nTarget Shopping List:\n\n`;
      
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
      text = `🚨 URGENT: OUT OF STOCK\nAlert Time: ${now}\nI am currently shopping and cannot source the following target items:\n\n`;
      
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
      text = `🚚 TRUCK LOADED\nDeparting: ${now}\nHeading to drop-offs. Current Fulfillment Plan:\n\n`;
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
      text = `✅ RUN COMPLETE\nOfficial Delivery Record:\n`;
      text += `⏱️ Started: ${deliveryStartTime || "Unknown"}\n`;
      text += `⏱️ Finished: ${now}\n\n`;

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