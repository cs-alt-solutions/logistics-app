import React, { useState, useMemo } from 'react';
import { GLOSSARY } from '../glossary';
import { Plus, ChevronDown, ChevronUp, Search, PackagePlus, Edit3, X } from 'lucide-react';
import PlanogramManager from './PlanogramManager'; 

export default function AdminAssetInjector({ catalog, activeLocation, activeLocRunItems, upsertRunItem, setEditingItem, setIsAddingItem, updateCatalogItem, refreshData }) {
  const [showInjector, setShowInjector] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const availableItems = useMemo(() => {
    return catalog.filter(catItem => 
      !activeLocRunItems.find(runItem => runItem.item_id === catItem.id) &&
      !(catItem.excluded_locations || []).includes(activeLocation.id) 
    );
  }, [catalog, activeLocRunItems, activeLocation.id]);

  const categories = [...new Set(availableItems.map(i => i.category || 'Uncategorized'))].sort();

  const handleQtyChange = (itemId) => {
    const item = catalog.find(c => c.id === itemId);
    upsertRunItem(itemId, activeLocation.id, 1, item?.preferred_vendor || GLOSSARY.defaultVendor); 
  };

  const handleExcludeItem = (e, item) => {
    e.stopPropagation();
    const currentExclusions = item.excluded_locations || [];
    const updatedItem = { ...item, excluded_locations: [...currentExclusions, activeLocation.id] };
    updateCatalogItem(updatedItem);
  };

  const isStrict = activeLocation?.strict_planogram;

  return (
    <div className="w-full">
      <button onClick={() => setShowInjector(!showInjector)} className={`w-full p-3 rounded-xl border-2 transition-all font-black uppercase tracking-wider flex items-center justify-between text-sm ${showInjector ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
        <div className="flex items-center gap-2"><PackagePlus size={18} /> {isStrict ? 'Manage Planogram' : 'Add Items to Order'}</div>
        {showInjector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showInjector && (
        <div className="mt-3 space-y-6 animate-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto scrollbar-hide pb-10">
          
          {isStrict ? (
            <PlanogramManager 
                catalog={catalog} 
                activeLocation={activeLocation} 
                activeLocRunItems={activeLocRunItems} 
                upsertRunItem={upsertRunItem} 
                refreshData={refreshData} 
                setIsAddingItem={setIsAddingItem} // <-- Passes ability to create new items
            />
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  placeholder="Search catalog to add to order..." 
                  value={catalogSearch} 
                  onChange={e => setCatalogSearch(e.target.value)} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-9 text-xs font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>
              
              <div className="space-y-6">
                {categories.map(category => {
                  const itemsInCat = availableItems.filter(i => (i.category || 'Uncategorized') === category && i.name.toLowerCase().includes(catalogSearch.toLowerCase()));
                  
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-b border-zinc-800 pb-1">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {itemsInCat.map(item => (
                          <button key={item.id} onClick={() => handleQtyChange(item.id)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all text-left flex flex-col justify-between group">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-zinc-300 text-xs group-hover:text-cyan-400 leading-tight pr-2">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <div onClick={(e) => handleExcludeItem(e, item)} className="p-1 rounded text-zinc-600 hover:text-rose-500 hover:bg-zinc-800 transition-colors" title="Hide item from this location">
                                    <X size={12} />
                                </div>
                                <div onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-1 rounded text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 transition-colors" title="Edit Item">
                                    <Edit3 size={12} />
                                </div>
                                <Plus size={14} className="text-zinc-600 group-hover:text-cyan-400 shrink-0 ml-1" />
                              </div>
                            </div>
                            <span className="text-[9px] uppercase font-black text-zinc-600 mt-2">{item.unit}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <button onClick={() => setIsAddingItem(true)} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Create New Catalog Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}