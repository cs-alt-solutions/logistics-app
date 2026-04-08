import React, { useState } from 'react';
import { GLOSSARY } from '../glossary';
import { Send, AlertCircle, RefreshCw, Minus, Plus, Edit2, Activity, CheckCircle, XCircle, Clock, Database, MapPin, CheckSquare, ListRestart } from 'lucide-react';
import AdminAssetInjector from './AdminAssetInjector';
import { EditItemModal } from './Modals';

export default function AdminCommandCenter({ catalog, setCatalog, runItems, upsertRunItem, runPhase, setRunPhase, rolloverQueue, setRolloverQueue, dispatchRun, runHistory }) {
  const [activeLocKey, setActiveLocKey] = useState(Object.keys(GLOSSARY.locations)[0]);
  const [editingItem, setEditingItem] = useState(null);
  
  // NEW: Admin View Controls & Card Logic
  const [viewHistory, setViewHistory] = useState(false);
  const [cardLocId, setCardLocId] = useState("");

  const isRunActive = runPhase === GLOSSARY.system.phases.SHOPPING || runPhase === GLOSSARY.system.phases.DELIVERING;

  // Handle active location safely (it will be null if the Tracker tab is active)
  const activeLocation = activeLocKey === 'tracker' ? null : GLOSSARY.locations[activeLocKey];
  const activeLocRunItems = activeLocation ? runItems.filter(i => i.locId === activeLocation.id && i.qty > 0 && i.itemId !== 'biz-card') : [];
  const totalItems = runItems.reduce((acc, curr) => curr.itemId !== 'biz-card' ? acc + curr.qty : acc, 0);

  // Tracker Math
  const inventoryItems = runItems.filter(i => i.itemId !== 'biz-card');
  const pendingCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.PENDING).length;
  const procuredCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.PROCURED || i.status === GLOSSARY.system.itemStatus.DELIVERED).length;
  const skippedCount = inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.SKIPPED).length;
  const totalCount = inventoryItems.length;
  const progress = totalCount === 0 ? 0 : Math.round(((procuredCount + skippedCount) / totalCount) * 100);

  const handleQtyChange = (itemId, delta) => {
    if (!activeLocation) return;
    const current = runItems.find(i => i.itemId === itemId && i.locId === activeLocation.id);
    const currentQty = current ? current.qty : 0;
    const vendor = catalog.find(c => c.id === itemId)?.preferredVendor || GLOSSARY.defaultVendor;
    upsertRunItem(itemId, activeLocation.id, Math.max(0, currentQty + delta), vendor);
    
    // PLANNING phase logic is now handled in App.jsx via clockIn/dispatch states
  };

  const handleUpdateItem = (updatedItem) => {
    setCatalog(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
  };

  const injectRollover = (rollItem, index) => {
    upsertRunItem(rollItem.itemId, rollItem.locId, rollItem.qty, rollItem.vendor);
    setRolloverQueue(prev => prev.filter((_, i) => i !== index));
  };

  const executeDispatch = () => {
    if (!cardLocId) return;
    dispatchRun(cardLocId);
    setActiveLocKey('tracker'); // Auto-switch to tracking view when dispatched
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in pb-24 relative">
      {editingItem && (
        <EditItemModal item={editingItem} onSave={handleUpdateItem} onClose={() => setEditingItem(null)} />
      )}

      {/* Live Run Banner */}
      {isRunActive && (
        <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3 flex items-center justify-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest shadow-inner">
          <Activity size={16} className="animate-pulse" /> Live Tracker Active
        </div>
      )}

      {/* NEW: View History Toggle */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
          <button onClick={() => setViewHistory(!viewHistory)} className={`w-full p-2.5 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider transition-all border ${viewHistory ? 'bg-amber-950 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-amber-400 hover:border-amber-500/50'}`}>
              <Database size={16}/> {viewHistory ? 'Hide Run History' : 'View Completed Runs'} ({runHistory.length})
          </button>
      </div>

      {/* NEW: RUN HISTORY VIEW */}
      {viewHistory && (
          <div className="p-4 flex-1 space-y-4 animate-in slide-in-from-top-4">
              <h2 className="text-xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-2 mb-6"><CheckSquare size={20}/> Completed Run History</h2>
              {runHistory.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                    <Database size={32} className="text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-bold">No runs recorded in history database database yet.</p>
                  </div>
              ) : (
                  runHistory.map(run => (
                      <div key={run.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-md space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                              <span className="text-zinc-100 font-black text-lg">{run.unitsTotal} Units <span className="text-xs text-zinc-500 font-bold ml-1">Total Payload</span></span>
                              <span className="text-zinc-600 font-bold text-xs">{new Date(run.endTime).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-400">Time Clock: {new Date(run.dispatchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} - {new Date(run.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
                          <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest pt-2">
                              <span className="bg-emerald-950/40 text-emerald-400 px-2 py-1 rounded border border-emerald-500/50">{run.procuredUnits} Got</span>
                              {run.skippedUnits > 0 && <span className="bg-rose-950/40 text-rose-400 px-2 py-1 rounded border border-rose-500/50">{run.skippedUnits} Skipped</span>}
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}

      {!viewHistory && (
        <>
            {/* Rollover Queue */}
            {rolloverQueue.length > 0 && !isRunActive && (
              <div className="bg-amber-500/10 border-b border-amber-500/30 p-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400 mb-3 font-black text-sm uppercase tracking-wider">
                  <AlertCircle size={16} /> Skipped Last Run
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {rolloverQueue.map((item, idx) => {
                    const catItem = catalog.find(c => c.id === item.itemId);
                    const loc = Object.values(GLOSSARY.locations).find(l => l.id === item.locId);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                        <div>
                          <span className="font-bold text-zinc-200 block text-sm">{catItem?.name} <span className="text-zinc-500">({item.qty})</span></span>
                          <span className={`text-[10px] uppercase font-black ${loc?.theme.text}`}>{loc?.name}</span>
                        </div>
                        <button onClick={() => injectRollover(item, idx)} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 p-2 rounded-lg transition-colors font-bold text-xs uppercase flex items-center gap-1">
                          <ListRestart size={12} /> Inject
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STICKY CONTROL HEADER */}
            <div className="sticky top-[58px] z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
              <div className="flex overflow-x-auto snap-x scrollbar-hide gap-2 px-3 py-3 border-b border-zinc-800/50">
                
                {/* TRACKER TAB - Appears dynamically when run is active */}
                {isRunActive && (
                  <button onClick={() => setActiveLocKey('tracker')} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${activeLocKey === 'tracker' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-cyan-400'}`}>
                    <Activity size={14} className={activeLocKey === 'tracker' ? 'animate-pulse' : ''} /> Live Tracker
                  </button>
                )}

                {/* LOCATION TABS */}
                {Object.entries(GLOSSARY.locations).map(([key, loc]) => {
                  const isActive = activeLocKey === key;
                  const locQty = runItems.filter(i => i.locId === loc.id).reduce((acc, curr) => curr.itemId !== 'biz-card' ? acc + curr.qty : acc, 0);
                  return (
                    <button key={key} onClick={() => setActiveLocKey(key)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${isActive ? `${loc.theme.bgLight} ${loc.theme.border} ${loc.theme.text}` : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                      <loc.icon size={14} className={isActive ? loc.theme.glow : ''} />
                      {loc.name}
                      {locQty > 0 && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? `${loc.theme.bg} text-zinc-950` : 'bg-zinc-800 text-zinc-400'}`}>{locQty}</span>}
                    </button>
                  );
                })}
              </div>

              {/* ASSET INJECTOR */}
              {activeLocation && (
                <div className="px-4 py-3">
                  <AdminAssetInjector 
                    catalog={catalog}
                    setCatalog={setCatalog}
                    activeLocation={activeLocation}
                    activeLocRunItems={activeLocRunItems}
                    upsertRunItem={upsertRunItem}
                    runPhase={runPhase}
                    setRunPhase={setRunPhase}
                  />
                </div>
              )}
            </div>

            <div className="p-4 flex-1 space-y-6">
              
              {/* LIVE TRACKER DASHBOARD */}
              {activeLocKey === 'tracker' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* Progress Card */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">Run Progress</h3>
                      <span className="text-cyan-400 font-black text-xl leading-none">{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-4 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                      <div className="bg-cyan-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] uppercase font-black tracking-widest">
                      <span className="text-zinc-500">{pendingCount} Pending</span>
                      <span className="text-emerald-400">{procuredCount} Picked</span>
                      <span className="text-rose-400">{skippedCount} Skipped</span>
                    </div>
                  </div>

                  {/* Picked Items List */}
                  {procuredCount > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle size={14} /> Grabbed & Secured ({procuredCount})</h3>
                      <div className="space-y-2">
                        {inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.PROCURED || i.status === GLOSSARY.system.itemStatus.DELIVERED).map(item => {
                          const catItem = catalog.find(c => c.id === item.itemId);
                          const loc = Object.values(GLOSSARY.locations).find(l => l.id === item.locId);
                          return (
                            <div key={item.id} className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl flex justify-between items-center shadow-md animate-in zoom-in-95">
                              <div>
                                <span className="font-bold text-emerald-100 text-sm">{catItem?.name}</span>
                                <span className="text-emerald-500/70 text-[10px] font-black ml-2 uppercase">x{item.qty} {catItem?.unit}</span>
                              </div>
                              <span className={`text-[9px] uppercase font-black px-2 py-1 rounded border ${loc?.theme.bgLight} ${loc?.theme.border} ${loc?.theme.text}`}>{loc?.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  {/* Skipped Items List */}
                  {skippedCount > 0 && (
                    <section>
                      <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2"><XCircle size={14} /> Out of Stock / Skipped ({skippedCount})</h3>
                      <div className="space-y-2">
                        {inventoryItems.filter(i => i.status === GLOSSARY.system.itemStatus.SKIPPED).map(item => {
                          const catItem = catalog.find(c => c.id === item.itemId);
                          const loc = Object.values(GLOSSARY.locations).find(l => l.id === item.locId);
                          return (
                            <div key={item.id} className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-xl flex justify-between items-center shadow-md animate-in zoom-in-95 opacity-80">
                              <div>
                                <span className="font-bold text-rose-100 text-sm line-through opacity-70">{catItem?.name}</span>
                              </div>
                              <span className={`text-[9px] uppercase font-black px-2 py-1 rounded border ${loc?.theme.bgLight} ${loc?.theme.border} ${loc?.theme.text} opacity-70`}>{loc?.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                
                /* ACTIVE LOCATION PAYLOAD (Editable Matrix) */
                <section className="animate-in fade-in">
                  <h2 className="text-sm font-black text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                    Active Payload <span className={activeLocation?.theme.text}>• {activeLocation?.name}</span>
                  </h2>
                  
                  {activeLocRunItems.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                      <p className="text-zinc-500 font-bold text-sm">No items queued for this location.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeLocRunItems.map(runItem => {
                        const item = catalog.find(c => c.id === runItem.itemId);
                        const isPicked = runItem.status === GLOSSARY.system.itemStatus.PROCURED || runItem.status === GLOSSARY.system.itemStatus.DELIVERED;
                        const isSkipped = runItem.status === GLOSSARY.system.itemStatus.SKIPPED;

                        return (
                          <div key={item.id} className={`p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all group ${isPicked ? 'bg-emerald-950/10 border-emerald-900/30' : isSkipped ? 'bg-rose-950/10 border-rose-900/30 opacity-60' : 'border-zinc-700 bg-zinc-800'}`}>
                            <div className="flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-zinc-100 leading-tight">{item.name}</h3>
                                
                                {/* Driver Status Badges */}
                                {isPicked && <CheckCircle size={14} className="text-emerald-500" title="Driver Grabbed This" />}
                                {isSkipped && <XCircle size={14} className="text-rose-500" title="Driver Skipped This" />}
                                
                                <button onClick={() => setEditingItem(item)} className="p-1 rounded-md text-zinc-500 hover:text-cyan-400 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100">
                                  <Edit2 size={14} />
                                </button>
                              </div>
                              <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/40 border border-cyan-500/50 px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block">{item.unit}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-1 border border-zinc-700 shadow-inner">
                              <button onClick={() => handleQtyChange(item.id, -1)} className="p-2 rounded-lg transition-colors text-zinc-300 hover:text-rose-400 hover:bg-rose-950/30"><Minus size={18} /></button>
                              <span className="w-6 text-center font-black text-lg text-zinc-100">{runItem.qty}</span>
                              <button onClick={() => handleQtyChange(item.id, 1)} className="p-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"><Plus size={18} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* NEW: DISPATCH MECHANICS WITH CARD REQUIREMENT */}
            {runPhase !== GLOSSARY.system.phases.SHOPPING && runPhase !== GLOSSARY.system.phases.DELIVERING && totalItems > 0 && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 sticky bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] space-y-3">
                    {/* Card Pickup Selector */}
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
                        <MapPin size={24} className={cardLocId ? "text-cyan-400" : "text-zinc-700"} />
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Bus. Card Required: Select Pickup Location</label>
                            <select value={cardLocId} onChange={e => setCardLocId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50">
                                <option value="" disabled>-- Select location where card is located --</option>
                                {Object.values(GLOSSARY.locations).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Dispatch Button - Enabled only if card loc is selected */}
                    <button onClick={executeDispatch} disabled={!cardLocId} className={`w-full font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${cardLocId ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'}`}>
                        <Send size={20} /> {cardLocId ? `Dispatch to Driver (${totalItems} Items)` : 'Select Card Pickup Location'}
                    </button>
                </div>
            )}
        </>
      )}
    </div>
  );
}