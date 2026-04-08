import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { GLOSSARY } from '../glossary';
import { Plus, ChevronDown, ChevronUp, Star, Search, PackagePlus, Layers, Edit3, Save, Trash2, X } from 'lucide-react';

export default function AdminAssetInjector({ catalog, activeLocation, activeLocRunItems, upsertRunItem, runPhase, setRunPhase, setEditingItem, setIsAddingItem }) {
  const [showInjector, setShowInjector] = useState(false);
  const [isManagingLayout, setIsManagingLayout] = useState(false);
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [tempZoneName, setTempZoneName] = useState("");

  const availableItems = useMemo(() => {
    return catalog.filter(catItem => !activeLocRunItems.find(runItem => runItem.item_id === catItem.id));
  }, [catalog, activeLocRunItems]);

  const frequentItems = availableItems.filter(i => i.is_favorite);

  const handleQtyChange = (itemId) => {
    const item = catalog.find(c => c.id === itemId);
    upsertRunItem(itemId, activeLocation.id, 1, item?.preferred_vendor || GLOSSARY.defaultVendor); 
    if (runPhase === GLOSSARY.system.phases.IDLE) setRunPhase(GLOSSARY.system.phases.PLANNING);
  };

  const handleAddNewZone = async () => {
    const newId = `zone-${Date.now()}`;
    const { error } = await supabase.from('location_zones').insert([{
      id: newId,
      location_id: activeLocation.id,
      name: 'New physical zone',
      item_ids: []
    }]);
    if (!error) {
      setEditingZoneId(newId);
      setTempZoneName('New physical zone');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this shelf/cooler?")) return;
    const { error } = await supabase.from('location_zones').delete().eq('id', zoneId);
    if (!error) setEditingZoneId(null);
  };

  const toggleItemInZone = async (zone, itemId) => {
    const currentItemIds = zone.item_ids || [];
    const hasItem = currentItemIds.includes(itemId);
    const newItemIds = hasItem ? currentItemIds.filter(id => id !== itemId) : [...currentItemIds, itemId];
    await supabase.from('location_zones').update({ item_ids: newItemIds }).eq('id', zone.id);
  };

  const saveZoneEdit = async (zoneId) => {
    const { error } = await supabase.from('location_zones').update({ name: tempZoneName }).eq('id', zoneId);
    if (!error) setEditingZoneId(null);
  };

  const locationZones = activeLocation?.zones || [];
  const isStrict = activeLocation?.strict_planogram;

  return (
    <div className="w-full">
      <button onClick={() => setShowInjector(!showInjector)} className={`w-full p-3 rounded-xl border-2 transition-all font-black uppercase tracking-wider flex items-center justify-between text-sm ${showInjector ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}>
        <div className="flex items-center gap-2"><PackagePlus size={18} /> {isStrict ? 'Manage Store Layout' : 'Inject Stock'}</div>
        {showInjector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showInjector && (
        <div className="mt-3 space-y-6 animate-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto scrollbar-hide pb-10">
          
          {isStrict ? (
            <>
              {/* ... Strict layout code remains exactly the same ... */}
              <div className="flex items-center justify-between">
                <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeLocation?.theme?.text || 'text-cyan-400'}`}><Layers size={14} /> Physical Layout Zones</h3>
                <button onClick={() => setIsManagingLayout(!isManagingLayout)} className={`text-[10px] font-black px-2 py-1 rounded transition-colors uppercase ${isManagingLayout ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isManagingLayout ? 'Stop Editing' : 'Edit Layout'}
                </button>
              </div>

              <div className="space-y-4">
                {locationZones.map(zone => {
                  const isEditing = editingZoneId === zone.id;
                  return (
                    <div key={zone.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                      <div className={`px-3 py-2 border-b border-zinc-800 flex items-center justify-between ${activeLocation?.theme?.bgLight || 'bg-zinc-900/40'}`}>
                         {isEditing ? (
                           <input value={tempZoneName} onChange={e => setTempZoneName(e.target.value)} className="bg-zinc-950 border border-cyan-500/50 text-zinc-100 text-xs font-bold px-2 py-1 rounded w-2/3" autoFocus />
                         ) : (
                           <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">{zone.name}</span>
                         )}
                         <div className="flex items-center gap-3">
                            {isManagingLayout && (
                              <>
                                {isEditing ? (
                                   <button onClick={() => saveZoneEdit(zone.id)} className="text-emerald-400 hover:scale-110 transition-transform"><Save size={16}/></button>
                                ) : (
                                   <button onClick={() => { setEditingZoneId(zone.id); setTempZoneName(zone.name); }} className="text-zinc-500 hover:text-cyan-400"><Edit3 size={16}/></button>
                                )}
                                <button onClick={() => handleDeleteZone(zone.id)} className="text-zinc-700 hover:text-rose-500"><Trash2 size={16}/></button>
                              </>
                            )}
                         </div>
                      </div>

                      {isEditing ? (
                        <div className="p-3 bg-zinc-900/50 space-y-3">
                          <div className="relative">
                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input placeholder="Search and assign items..." value={zoneSearchQuery} onChange={e => setZoneSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-bold pl-8 text-zinc-100" />
                          </div>
                          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                             {catalog.filter(i => i.name.toLowerCase().includes(zoneSearchQuery.toLowerCase())).map(item => {
                               const active = (zone.item_ids || []).includes(item.id);
                               return (
                                 <button key={item.id} onClick={() => toggleItemInZone(zone, item.id)} className={`w-full text-left p-2 rounded-lg text-[10px] font-bold flex items-center justify-between border transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-inner' : 'bg-zinc-950 text-zinc-600 border-zinc-800'}`}>
                                   {item.name} {active ? <X size={10} className="text-rose-500" /> : <Plus size={10} />}
                                 </button>
                               );
                             })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 grid grid-cols-2 gap-2">
                          {(!zone.item_ids || zone.item_ids.length === 0) ? (
                            <div className="col-span-2 text-[9px] text-zinc-600 font-black uppercase text-center py-4 bg-zinc-900/30 rounded-lg italic">Empty Shelf</div>
                          ) : (
                            zone.item_ids.map(itemId => {
                              const item = catalog.find(c => c.id === itemId);
                              const isAlreadyStaged = activeLocRunItems.find(ri => ri.item_id === itemId);
                              if (!item || isAlreadyStaged) return null;

                              return (
                                <button key={itemId} onClick={() => handleQtyChange(itemId)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-950/20 transition-all text-left group flex items-center justify-between">
                                  <span className="font-bold text-zinc-300 text-[10px] group-hover:text-blue-400 truncate pr-2">{item.name}</span>
                                  <div className="flex items-center gap-2">
                                      <div onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-1 rounded text-zinc-600 hover:text-cyan-400 hover:bg-zinc-800 transition-colors">
                                          <Edit3 size={12} />
                                      </div>
                                      <Plus size={14} className="text-zinc-600 group-hover:text-blue-400 shrink-0" />
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isManagingLayout && (
                  <button onClick={handleAddNewZone} className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">+ Add New physical shelf/cooler</button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  placeholder="Search catalog to inject..." 
                  value={catalogSearch} 
                  onChange={e => setCatalogSearch(e.target.value)} 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-9 text-xs font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50 transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableItems
                  .filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map(item => (
                  <button key={item.id} onClick={() => handleQtyChange(item.id)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all text-left flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-zinc-300 text-xs group-hover:text-cyan-400 leading-tight pr-2">{item.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-1 rounded text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 transition-colors">
                            <Edit3 size={12} />
                        </div>
                        <Plus size={14} className="text-zinc-600 group-hover:text-cyan-400 shrink-0" />
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-black text-zinc-600 mt-2">{item.unit}</span>
                  </button>
                ))}
              </div>

              {/* NEW BUTTON: Create a brand new item here */}
              <div className="pt-2">
                <button onClick={() => setIsAddingItem(true)} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Create New Catalog Item
                </button>
              </div>
            </div>
          )}

          {!isStrict && frequentItems.length > 0 && !catalogSearch && (
            <div className="pt-4 border-t border-zinc-800/50 space-y-4 mt-6">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1"><Star size={12} className="fill-amber-400" /> Frequent Favorites</h3>
              <div className="grid grid-cols-2 gap-2">
                {frequentItems.map(item => (
                  <button key={item.id} onClick={() => handleQtyChange(item.id)} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-950/20 transition-all text-left flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-zinc-300 text-xs group-hover:text-amber-400">{item.name}</span>
                        <div onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-1 rounded text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-colors">
                            <Edit3 size={12} />
                        </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}