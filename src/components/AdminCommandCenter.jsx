import React, { useState } from 'react';
import { GLOSSARY } from '../glossary';
import { Send, Activity, Database, MapPin, Plus, Minus, ClipboardList, PackageCheck } from 'lucide-react';
import AdminAssetInjector from './AdminAssetInjector';
import { EditItemModal, AddItemModal } from './Modals';
import BackorderAlert from './BackorderAlert';
import RunHistory from './RunHistory';

export default function AdminCommandCenter({ catalog, locations, runItems, upsertRunItem, runPhase, dispatchRun, runHistory, updateCatalogItem, addCatalogItem, backorders, resolveBackorder, refreshData }) {
  const [activeLocKey, setActiveLocKey] = useState(Object.keys(GLOSSARY.locations)[0]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [cardLocId, setCardLocId] = useState("");

  const isRunActive = runPhase === GLOSSARY.system.phases.SHOPPING || runPhase === GLOSSARY.system.phases.DELIVERING;
  const activeLocation = activeLocKey === 'tracker' ? null : locations[activeLocKey];
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

  return (
    <div className="flex flex-col h-full animate-in fade-in pb-24 relative">
      {editingItem && <EditItemModal item={editingItem} onSave={(updated) => { updateCatalogItem(updated); setEditingItem(null); }} onClose={() => setEditingItem(null)} />}
      {isAddingItem && <AddItemModal onSave={(newItem) => { addCatalogItem(newItem); setIsAddingItem(false); }} onClose={() => setIsAddingItem(false)} />}

      {isRunActive && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3 flex items-center justify-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest shadow-inner sticky top-0 z-30 backdrop-blur-md">
          <Activity size={16} className="animate-pulse" /> Live Manifest Active
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
                              <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/40 border border-cyan-500/50 px-2 py-0.5 rounded uppercase mt-1.5 inline-block">{item?.unit}</span>
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
                    <button onClick={() => dispatchRun(cardLocId)} disabled={!cardLocId} className={`w-full font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${cardLocId ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'}`}>
                        <PackageCheck size={20} /> Approve & Dispatch Manifest ({totalItems} Items)
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}