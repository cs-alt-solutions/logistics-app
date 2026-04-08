import React, { useState } from 'react';
import { GLOSSARY } from '../glossary';
import { Send, Activity, CheckCircle, Clock, Database, MapPin, CheckSquare, ChevronDown, CreditCard } from 'lucide-react';
import AdminAssetInjector from './AdminAssetInjector';
import { EditItemModal } from './Modals';

export default function AdminCommandCenter({ catalog, setCatalog, locations, setLocations, runItems, upsertRunItem, runPhase, setRunPhase, dispatchRun, runHistory }) {
  const [activeLocKey, setActiveLocKey] = useState(Object.keys(GLOSSARY.locations)[0]);
  const [editingItem, setEditingItem] = useState(null);
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
      {editingItem && (
        <EditItemModal item={editingItem} onSave={() => setEditingItem(null)} onClose={() => setEditingItem(null)} />
      )}

      {isRunActive && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3 flex items-center justify-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest shadow-inner sticky top-0 z-30 backdrop-blur-md">
          <Activity size={16} className="animate-pulse" /> Live Tracker Active
        </div>
      )}

      <div className="p-3 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
          <button onClick={() => setViewHistory(!viewHistory)} className={`w-full p-2.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider transition-all border ${viewHistory ? 'bg-amber-950 text-amber-400 border-amber-500/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
              <Database size={16}/> {viewHistory ? 'Hide Run History' : 'View Completed Runs'} ({runHistory?.length || 0})
          </button>
      </div>

      {viewHistory ? (
          <div className="p-4 flex-1 space-y-4 animate-in slide-in-from-top-4">
              <h2 className="text-xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-2 mb-6"><CheckSquare size={20}/> Completed Run History</h2>
              {runHistory?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                    <Database size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-bold">No runs recorded in history database yet.</p>
                  </div>
              ) : (
                  runHistory.map(run => (
                    <div key={run.id} className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-md overflow-hidden transition-all">
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-zinc-100 font-black text-lg">Completed Run</span>
                                <span className="text-zinc-600 font-bold text-xs">{new Date(run.end_time).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-400">Dispatch: {new Date(run.dispatch_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    </div>
                  ))
              )}
          </div>
      ) : (
        <>
            <div className="sticky top-[58px] z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
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
                    catalog={catalog} setCatalog={setCatalog} 
                    locations={locations} setLocations={setLocations}
                    activeLocation={activeLocation} activeLocRunItems={activeLocRunItems}
                    upsertRunItem={upsertRunItem} runPhase={runPhase} setRunPhase={setRunPhase}
                  />
                </div>
              )}
            </div>

            <div className="p-4 flex-1 space-y-6">
              {activeLocKey === 'tracker' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">Run Progress</h3>
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
                    Active Payload <span className="text-emerald-400">• {activeLocation?.name}</span>
                  </h2>
                  
                  {activeLocRunItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                      <p className="text-zinc-500 font-bold text-sm">No items queued for this location.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeLocRunItems.map(runItem => {
                        const item = catalog.find(c => c.id === runItem.item_id);
                        return (
                          <div key={runItem.id} className="p-4 rounded-2xl border border-zinc-700 bg-zinc-800 flex items-center justify-between shadow-md transition-all group">
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
                    <button onClick={() => dispatchRun(cardLocId)} disabled={!cardLocId} className={`w-full font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${cardLocId ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'}`}>
                        <Send size={20} /> Dispatch Driver ({totalItems} Items)
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}