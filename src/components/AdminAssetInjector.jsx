import React, { useState, useMemo } from 'react';
import { GLOSSARY } from '../glossary';
import { Plus, ChevronDown, ChevronUp, Star, Search, PackagePlus, Database } from 'lucide-react';

export default function AdminAssetInjector({ catalog, setCatalog, activeLocation, activeLocRunItems, upsertRunItem, runPhase, setRunPhase }) {
  const [showInjector, setShowInjector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [newItem, setNewItem] = useState({ name: '', unit: 'Each', preferredVendor: GLOSSARY.defaultVendor, isOneOff: false });

  const availableItems = useMemo(() => {
    return catalog.filter(catItem => !activeLocRunItems.find(runItem => runItem.itemId === catItem.id));
  }, [catalog, activeLocRunItems]);

  const frequentItems = availableItems.filter(i => i.isFavorite && !i.isTemporary);
  const standardItems = availableItems.filter(i => !i.isFavorite && !i.isTemporary && i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleQtyChange = (itemId) => {
    const vendor = catalog.find(c => c.id === itemId)?.preferredVendor || GLOSSARY.defaultVendor;
    // Always injects 1 into the currently selected tab's payload
    upsertRunItem(itemId, activeLocation.id, 1, vendor); 
    
    if (runPhase === GLOSSARY.system.phases.IDLE) {
      setRunPhase(GLOSSARY.system.phases.PLANNING);
    }
  };

  const handleAddNewAsset = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    
    const newItemId = `item-${Date.now()}`;
    const itemToAdd = {
      id: newItemId,
      name: newItem.name.trim(),
      unit: newItem.unit.trim() || 'Each',
      category: 'Custom',
      preferredVendor: newItem.preferredVendor || GLOSSARY.defaultVendor,
      locations: [activeLocation.id], 
      isFavorite: false,
      isTemporary: newItem.isOneOff 
    };
    
    setCatalog(prev => [...prev, itemToAdd]);
    upsertRunItem(newItemId, activeLocation.id, 1, itemToAdd.preferredVendor);
    
    setNewItem({ name: '', unit: 'Each', preferredVendor: GLOSSARY.defaultVendor, isOneOff: false });
    setIsAddingNew(false);
    
    if (runPhase === GLOSSARY.system.phases.IDLE) setRunPhase(GLOSSARY.system.phases.PLANNING);
  };

  return (
    <div className="w-full">
      <button 
        onClick={() => setShowInjector(!showInjector)}
        className={`w-full p-3 rounded-xl border-2 transition-all font-black uppercase tracking-wider flex items-center justify-between text-sm ${showInjector ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
      >
        <div className="flex items-center gap-2"><PackagePlus size={18} /> Inject Stock</div>
        {showInjector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showInjector && (
        <div className="mt-3 space-y-5 animate-in slide-in-from-top-2 duration-200 max-h-[50vh] overflow-y-auto scrollbar-hide pb-2">
          
          {frequentItems.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Star size={12} className="fill-amber-400" /> Frequent Stock</h3>
              <div className="grid grid-cols-2 gap-2">
                {frequentItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleQtyChange(item.id)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-950/20 transition-all text-left group flex flex-col justify-between h-full"
                  >
                    <span className="block font-bold text-zinc-300 text-sm group-hover:text-amber-400">{item.name}</span>
                    <span className="text-[9px] uppercase font-black text-zinc-600 mt-2">→ {activeLocation.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Catalog</h3>
               <button 
                 onClick={() => setIsAddingNew(!isAddingNew)}
                 className="text-[10px] font-black bg-zinc-800 text-cyan-400 px-2 py-1 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1 uppercase"
               >
                 {isAddingNew ? 'Cancel' : '+ New Asset'}
               </button>
             </div>

             {isAddingNew && (
               <form onSubmit={handleAddNewAsset} className="bg-cyan-950/20 border border-cyan-900/50 rounded-xl p-4 mb-3 space-y-3 animate-in fade-in zoom-in-95">
                 <div className="flex items-center justify-between text-cyan-400 mb-1">
                   <div className="flex items-center gap-2">
                     <Database size={16} /> <span className="font-black text-xs uppercase tracking-widest">Digitize New Item</span>
                   </div>
                 </div>
                 
                 <input type="text" placeholder="Item Name (e.g. 20oz Coke)" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50" />
                 
                 <div className="flex gap-2">
                   <input type="text" placeholder="Unit (Each, Case...)" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50" />
                   <select value={newItem.preferredVendor} onChange={e => setNewItem({...newItem, preferredVendor: e.target.value})} className="w-2/3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-300 focus:outline-none focus:border-cyan-500/50">
                     {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                   </select>
                 </div>

                 <div className="flex items-center gap-2 mt-2 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">
                   <input type="checkbox" id="isOneOff" checked={newItem.isOneOff} onChange={(e) => setNewItem({...newItem, isOneOff: e.target.checked})} className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950" />
                   <label htmlFor="isOneOff" className="text-[11px] font-bold text-zinc-400 cursor-pointer uppercase">One-Off Item (Do not save to Master Catalog)</label>
                 </div>

                 <button type="submit" className="w-full bg-cyan-500 text-zinc-950 font-black uppercase text-xs py-3 rounded-lg hover:bg-cyan-400 transition-colors mt-2">
                   Save & Inject to {activeLocation.name}
                 </button>
               </form>
             )}

             <div className="relative mb-3">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
               <input 
                 type="text" 
                 placeholder="Search global database..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50"
               />
             </div>
             
             <div className="space-y-2 pr-1">
               {standardItems.length === 0 ? (
                 <p className="text-zinc-600 text-xs text-center py-4 font-bold uppercase">No matching assets found.</p>
               ) : (
                 standardItems.map(item => (
                   <button 
                     key={item.id} 
                     onClick={() => handleQtyChange(item.id)}
                     className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all flex justify-between items-center group"
                   >
                     <span className="font-bold text-zinc-300 text-sm group-hover:text-cyan-400">{item.name}</span>
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-zinc-600 group-hover:text-cyan-400 transition-colors">Add to {activeLocation.name}</span>
                       <Plus size={16} className="text-zinc-500 group-hover:text-cyan-400" />
                     </div>
                   </button>
                 ))
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}