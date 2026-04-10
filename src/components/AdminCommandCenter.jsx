import React, { useState } from 'react';
import { GLOSSARY } from '../glossary';
import { Send, Activity, Database, MapPin, Plus, Minus, ClipboardList, PackageCheck, Search, Edit3, Trash2, X } from 'lucide-react';
import AdminAssetInjector from './AdminAssetInjector';
import { EditItemModal, AddItemModal } from './Modals';
import BackorderAlert from './BackorderAlert';
import RunHistory from './RunHistory';

export default function AdminCommandCenter({ catalog, locations, runItems, upsertRunItem, runPhase, dispatchRun, abortRun, runHistory, updateCatalogItem, addCatalogItem, deleteCatalogItem, backorders, resolveBackorder, refreshData }) {
  const [activeLocKey, setActiveLocKey] = useState(Object.keys(GLOSSARY.locations)[0]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false); 
  const [cardLocId, setCardLocId] = useState("");
  const [masterSearch, setMasterSearch] = useState("");

  const isRunActive = runPhase === GLOSSARY.system.phases.SHOPPING || runPhase === GLOSSARY.system.phases.DELIVERING;
  const activeLocation = (activeLocKey === 'tracker' || activeLocKey === 'master-catalog') ? null : locations[activeLocKey];
  
  const activeLocRunItems = activeLocation ? runItems.filter(i => i.loc_id === activeLocation.id && i.qty > 0 && i.item_id !== 'biz-card') : [];
  const totalItems = runItems.reduce((acc, curr) => curr.item_id !== 'biz-card' ? acc + curr.qty : acc, 0);

  const inventoryItems = runItems.filter(i => i.item_id !== 'biz-card');
  const pendingCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.PENDING).length;
  const procuredCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.PROCURED || i.status === GLOSSARY.system.itemStatus.DELIVERED).length;
  const skippedCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.SKIPPED).length;
  const totalCount = inventoryItems.length;
  const progress = totalCount === 0 ? 0 : Math.round(((procuredCount + skippedCount) / totalCount) * 100);

  const handleQtyChange = (itemId, delta) => {
    if (!activeLocation) return;
    const current = runItems.find(i => i.item_id === itemId && i.loc_id === activeLocation.id);
    const currentQty = current ? current.qty : 0;
    const itemData = catalog.find(c => c.id === itemId);
    upsertRunItem(itemId, activeLocation.id, Math.max(0, currentQty + delta), itemData?.preferred_vendor || GLOSSARY.defaultVendor);
  };

  const catalogCategories = [...new Set(catalog.map(i => i.category || 'Uncategorized'))].sort();

  return (
    <div className="flex flex-col h-full animate-in fade-in pb-24 relative">
      {editingItem && <EditItemModal item={editingItem} catalog={catalog} onSave={(updated) => { updateCatalogItem(updated); setEditingItem(null); }} onClose={() => setEditingItem(null)} />}
      {isAddingItem && <AddItemModal catalog={catalog} onSave={(newItem) => { addCatalogItem(newItem); setIsAddingItem(false); }} onClose={() => setIsAddingItem(false)} />}

      {showPreview && (
        <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md z-50 flex flex-col p-4 animate-in fade-in">
           <div className="flex justify-between items-center mb-6 pt-4">
               <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList size={20} /> Manifest Preview</h2>
               <button onClick={() => setShowPreview(false)} className="text-zinc-400 hover:text-zinc-100 bg-zinc-800 p-2 rounded-full"><X size={20}/></button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-6 pb-20">
               {Object.values(locations).map(loc => {
                   const locItems = runItems.filter(i => i.loc_id === loc.id && i.item_id !== 'biz-card');
                   if(locItems.length === 0) return null;
                   return (
                       <div key={loc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                           <div className="bg-zinc-800 px-4 py-3 font-black text-sm text-zinc-100 uppercase tracking-widest border-b border-zinc-700">{loc.name}</div>
                           <div className="p-2 space-y-1">
                               {locItems.map(ri => {
                                   const catItem = catalog.find(c => c.id === ri.item_id);
                                   return (
                                       <div key={ri.id} className="flex justify-between items-center p-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/50 transition-colors rounded-lg">
                                           <div className="flex flex-col">
                                              <span className="text-xs font-bold text-zinc-200">{catItem?.name}</span>
                                              {(catItem?.item_size || (catItem?.container_type && catItem?.container_type !== 'None') || (catItem?.flavors && catItem.flavors.length > 0)) && (
                                                <span className="text-[9px] text-zinc-500 uppercase font-black">
                                                  {catItem.item_size} {catItem.container_type !== 'None' ? catItem.container_type : ''} 
                                                  {catItem.flavors && catItem.flavors.length > 0 && ` [Flavors: ${catItem.flavors.join(', ')}]`}
                                                </span>
                                              )}
                                           </div>
                                           <span className="text-xs font-black text-cyan-400 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded shadow-inner">{ri.qty} {catItem?.unit}</span>
                                       </div>
                                   )
                               })}
                           </div>
                       </div>
                   )
               })}
           </div>
           <div className="mt-4 pb-4">
              <button onClick={() => setShowPreview(false)} className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-black uppercase rounded-xl transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]">Close Preview</button>
           </div>
        </div>
      )}

      {isRunActive && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3 flex items-center justify-between gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest shadow-inner sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2"><Activity size={16} className="animate-pulse" /> Live Manifest Active</div>
          <button onClick={abortRun} className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-3 py-1.5 rounded-lg text-[9px] hover:bg-rose-500/40 transition-colors">ABORT RUN</button>
        </div>
      )}

      <div className="p-3 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
          <button onClick={() => setViewHistory(!viewHistory)} className={`w-full p-2.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider transition-all border ${viewHistory ? 'bg-amber-950 text-amber-400 border-amber-500/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
              <Database size={16}/> {viewHistory ? 'Hide Run History' : 'View Completed Runs'} ({runHistory?.length || 0})
          </button>
      </div>

      {viewHistory ? (
          <RunHistory runHistory={runHistory} />
      ) : (
        <>
            {!isRunActive && <BackorderAlert backorders={backorders} catalog={catalog} locations={locations} onResolve={resolveBackorder} />}

            <div className={`sticky ${isRunActive ? 'top-[58px]' : 'top-0'} z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl mt-2`}>
              <div className="flex overflow-x-auto snap-x scrollbar-hide gap-2 px-3 py-3 border-b border-zinc-800/50">
                {isRunActive && (
                  <button onClick={() => setActiveLocKey('tracker')} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all border ${activeLocKey === 'tracker' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <Activity size={14} className={activeLocKey === 'tracker' ? 'animate-pulse' : ''} /> Live Tracker
                  </button>
                )}
                
                <button onClick={() => setActiveLocKey('master-catalog')} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase transition-all border ${activeLocKey === 'master-catalog' ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  <Database size={14} /> Master Catalog
                </button>

                {Object.entries(locations).map(([key, loc]) => {
                  const isActive = activeLocKey === key;
                  const locQty = runItems.filter(i => i.loc_id === loc.id).reduce((acc, curr) => curr.item_id !== 'biz-card' ? acc + curr.qty : acc, 0);
                  return (
                    <button key={key} onClick={() => setActiveLocKey(key)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase border transition-all ${isActive ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                      {loc.name}
                      {locQty > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500 text-zinc-950">{locQty}</span>}
                    </button>
                  );
                })}
              </div>

              {activeLocation && (
                <div className="px-4 py-3">
                  <AdminAssetInjector 
                    catalog={catalog}
                    activeLocation={activeLocation} activeLocRunItems={activeLocRunItems}
                    upsertRunItem={upsertRunItem}
                    setEditingItem={setEditingItem} setIsAddingItem={setIsAddingItem}
                    updateCatalogItem={updateCatalogItem} 
                    refreshData={refreshData}
                  />
                </div>
              )}
            </div>

            <div className="p-4 flex-1 space-y-6">
              {activeLocKey === 'tracker' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">Fulfillment Progress</h3>
                      <span className="text-cyan-400 font-black text-xl leading-none">{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-4 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                      <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] uppercase font-black">
                      <span className="text-zinc-500">{pendingCount} Pending</span>
                      <span className="text-emerald-400">{procuredCount} Picked</span>
                    </div>
                  </div>
                </div>
              ) : activeLocKey === 'master-catalog' ? (
                <section className="animate-in fade-in space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-indigo-400 tracking-widest uppercase flex items-center gap-2">
                      <Database size={16} /> Global Item Database
                    </h2>
                    <button onClick={() => setIsAddingItem(true)} className="text-[10px] font-black px-3 py-2 rounded-lg transition-colors uppercase bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/50 flex items-center gap-1.5 shadow-sm">
                      <Plus size={14} /> New Catalog Item
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      placeholder="Search global catalog..." 
                      value={masterSearch} 
                      onChange={e => setMasterSearch(e.target.value)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-9 text-xs font-bold text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-colors shadow-inner" 
                    />
                  </div>

                  <div className="space-y-6">
                    {catalogCategories.map(category => {
                      const itemsInCat = catalog.filter(i => (i.category || 'Uncategorized') === category && i.name.toLowerCase().includes(masterSearch.toLowerCase()));
                      if (itemsInCat.length === 0) return null;

                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">{category} ({itemsInCat.length})</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {itemsInCat.map(item => (
                              <div key={item.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-600 transition-colors shadow-sm">
                                <div>
                                  <h3 className="font-bold text-zinc-100 text-sm leading-tight">{item.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-black text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">{item.unit}</span>
                                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{item.preferred_vendor}</span>
                                  </div>
                                  {(item.item_size || (item.container_type && item.container_type !== 'None') || (item.flavors && item.flavors.length > 0)) && (
                                     <div className="text-[9px] font-bold text-zinc-400 mt-1.5 uppercase tracking-wider bg-zinc-950 p-1.5 rounded border border-zinc-800">
                                         {item.item_size} {item.container_type !== 'None' ? item.container_type : ''}
                                         {item.flavors && item.flavors.length > 0 && ` • Flavors: ${item.flavors.join(', ')}`}
                                     </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => setEditingItem(item)} className="p-2 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700" title="Edit Item">
                                    <Edit3 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to completely remove ${item.name} from the catalog?`)) {
                                        deleteCatalogItem(item.id);
                                      }
                                    }} 
                                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700" title="Delete Item">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="animate-in fade-in">
                  <h2 className="text-sm font-black text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <ClipboardList size={16} className="text-zinc-500" /> Staged Order <span className="text-emerald-400">• {activeLocation?.name}</span>
                  </h2>
                  
                  {activeLocRunItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                      <p className="text-zinc-500 font-bold text-sm">No items staged for this location's order.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeLocRunItems.map(runItem => {
                        const item = catalog.find(c => c.id === runItem.item_id);
                        return (
                          <div key={runItem.id} className="p-4 rounded-2xl border border-zinc-700 bg-zinc-800 flex items-center justify-between shadow-md transition-all group hover:border-zinc-500">
                            <div className="flex-1 pr-2">
                              <h3 className="font-bold text-zinc-100 leading-tight">{item?.name}</h3>
                              <div className="flex flex-col gap-1 mt-1.5">
                                 <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/40 border border-cyan-500/50 px-2 py-0.5 rounded uppercase inline-block">{item?.unit}</span>
                                     {(item?.item_size || (item?.container_type && item?.container_type !== 'None')) && (
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{item?.item_size} {item?.container_type !== 'None' ? item?.container_type : ''}</span>
                                     )}
                                 </div>
                                 {item?.flavors && item.flavors.length > 0 && (
                                     <span className="text-[8px] font-bold text-zinc-500 uppercase">Flavors: {item.flavors.join(', ')}</span>
                                 )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-1 border border-zinc-700 shadow-inner">
                              <button onClick={() => handleQtyChange(runItem.item_id, -1)} className="p-2 rounded-lg text-zinc-300 hover:text-rose-400"><Minus size={18} /></button>
                              <span className="w-6 text-center font-black text-lg text-zinc-100">{runItem.qty}</span>
                              <button onClick={() => handleQtyChange(runItem.item_id, 1)} className="p-2 rounded-lg text-cyan-400 hover:text-cyan-300"><Plus size={18} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>

            {runPhase !== GLOSSARY.system.phases.SHOPPING && runPhase !== GLOSSARY.system.phases.DELIVERING && totalItems > 0 && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] space-y-3">
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
                        <MapPin size={24} className={cardLocId ? "text-cyan-400" : "text-zinc-700"} />
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Bus. Card Required: Select Pickup Location</label>
                            <select value={cardLocId} onChange={e => setCardLocId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100 outline-none">
                                <option value="" disabled>-- Select Pickup --</option>
                                {Object.values(locations).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setShowPreview(true)} className="flex-1 font-black uppercase py-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30">
                           Preview Manifest
                       </button>
                       <button onClick={() => dispatchRun(cardLocId)} disabled={!cardLocId} className={`flex-1 font-black uppercase py-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${cardLocId ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'}`}>
                           <PackageCheck size={16} /> Dispatch
                       </button>
                    </div>
                    <button onClick={abortRun} className="w-full py-2 text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors">
                        Abort & Clear Draft
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}