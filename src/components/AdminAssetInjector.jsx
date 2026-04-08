import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { GLOSSARY } from '../glossary';
import { Plus, ChevronDown, ChevronUp, Star, Search, PackagePlus, Database, Layers, Edit3, Save, Trash2 } from 'lucide-react';

export default function AdminAssetInjector({ catalog, activeLocation, activeLocRunItems, upsertRunItem, runPhase, setRunPhase }) {
  const [showInjector, setShowInjector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isManagingLayout, setIsManagingLayout] = useState(false);
  
  // Zone Editing State
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [tempZoneName, setTempZoneName] = useState("");
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");

  const [newItem, setNewItem] = useState({ name: '', unit: 'Case', preferredVendor: GLOSSARY.defaultVendor, isOneOff: false });

  const availableItems = useMemo(() => {
    return catalog.filter(catItem => !activeLocRunItems.find(runItem => runItem.item_id === catItem.id));
  }, [catalog, activeLocRunItems]);

  const frequentItems = availableItems.filter(i => i.is_favorite && !i.is_temporary);
  const standardItems = availableItems.filter(i => !i.is_favorite && !i.is_temporary && i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleQtyChange = (itemId) => {
    const item = catalog.find(c => c.id === itemId);
    upsertRunItem(itemId, activeLocation.id, 1, item?.preferred_vendor || GLOSSARY.defaultVendor); 
    if (runPhase === GLOSSARY.system.phases.IDLE) setRunPhase(GLOSSARY.system.phases.PLANNING);
  };

  const handleAddNewAsset = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    
    const newItemId = `item-${Date.now()}`;
    
    const { error } = await supabase
      .from('catalog_items')
      .insert([{
        id: newItemId,
        name: newItem.name.trim(),
        unit: newItem.unit.trim() || 'Each',
        preferred_vendor: newItem.preferredVendor,
        is_favorite: false,
        is_temporary: newItem.isOneOff 
      }])
      .select();

    if (!error) {
      upsertRunItem(newItemId, activeLocation.id, 1, newItem.preferredVendor);
      setNewItem({ name: '', unit: 'Case', preferredVendor: GLOSSARY.defaultVendor, isOneOff: false });
      setIsAddingNew(false);
      if (runPhase === GLOSSARY.system.phases.IDLE) setRunPhase(GLOSSARY.system.phases.PLANNING);
    }
  };

  const handleAddNewZone = async () => {
    const newId = `zone-${Date.now()}`;
    await supabase.from('location_zones').insert([{
      id: newId,
      location_id: activeLocation.id,
      name: 'New Physical Zone',
      item_ids: []
    }]);
    setEditingZoneId(newId);
    setTempZoneName('New Physical Zone');
  };

  const saveZoneEdit = async (zoneId) => {
    await supabase.from('location_zones').update({ name: tempZoneName }).eq('id', zoneId);
    setEditingZoneId(null);
  };

  const deleteZone = async (zoneId) => {
    await supabase.from('location_zones').delete().eq('id', zoneId);
    setEditingZoneId(null);
  };

  const toggleItemInZone = async (zone, itemId) => {
    const hasItem = zone.item_ids?.includes(itemId);
    const newItemIds = hasItem 
      ? zone.item_ids.filter(id => id !== itemId) 
      : [...(zone.item_ids || []), itemId];
    
    await supabase.from('location_zones').update({ item_ids: newItemIds }).eq('id', zone.id);
  };

  const locationZones = activeLocation?.zones || [];
  const isStrict = activeLocation?.strict_planogram;

  return (
    <div className="w-full">
      <button onClick={() => setShowInjector(!showInjector)} className={`w-full p-3 rounded-xl border-2 transition-all font-black uppercase tracking-wider flex items-center justify-between text-sm ${showInjector ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}>
        <div className="flex items-center gap-2"><PackagePlus size={18} /> {isStrict ? 'Manage Store Layout' : 'Inject Stock'}</div>
        {showInjector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showInjector && (
        <div className="mt-3 space-y-6 animate-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto scrollbar-hide pb-10">
          <div className="flex items-center justify-between">
            <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeLocation?.theme?.text || 'text-cyan-400'}`}><Layers size={14} /> Physical Layout Zones</h3>
            <button onClick={() => setIsManagingLayout(!isManagingLayout)} className={`text-[10px] font-black px-2 py-1 rounded transition-colors uppercase ${isManagingLayout ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
              {isManagingLayout ? 'Stop Editing' : 'Edit Shelves'}
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
                     
                     <div className="flex items-center gap-2">
                        {isManagingLayout && (
                          <>
                            {isEditing ? (
                               <button onClick={() => saveZoneEdit(zone.id)} className="text-emerald-400"><Save size={14}/></button>
                            ) : (
                               <button onClick={() => { setEditingZoneId(zone.id); setTempZoneName(zone.name); }} className="text-zinc-500 hover:text-cyan-400"><Edit3 size={14}/></button>
                            )}
                            <button onClick={() => deleteZone(zone.id)} className="text-zinc-700 hover:text-rose-500"><Trash2 size={14}/></button>
                          </>
                        )}
                     </div>
                  </div>

                  {isEditing ? (
                    <div className="p-3 bg-zinc-900/50 space-y-3">
                      <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input placeholder="Search and add item..." value={zoneSearchQuery} onChange={e => setZoneSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-bold pl-8 text-zinc-100" />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                         {catalog.filter(i => i.name.toLowerCase().includes(zoneSearchQuery.toLowerCase())).map(item => {
                           const active = zone.item_ids?.includes(item.id);
                           return (
                             <button key={item.id} onClick={() => toggleItemInZone(zone, item.id)} className={`w-full text-left p-2 rounded-lg text-[10px] font-bold flex items-center justify-between ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-zinc-950 text-zinc-500'}`}>
                               {item.name} {active && <Plus size={10} className="rotate-45" />}
                             </button>
                           );
                         })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 grid grid-cols-2 gap-2">
                      {(zone.item_ids || []).length === 0 ? (
                        <div className="col-span-2 text-[9px] text-zinc-600 font-black uppercase text-center py-2 bg-zinc-900/30 rounded-lg italic">Empty Shelf</div>
                      ) : (
                        zone.item_ids.map(itemId => {
                          const item = catalog.find(c => c.id === itemId);
                          const isAlreadyStaged = activeLocRunItems.find(ri => ri.item_id === itemId);
                          if (!item || isAlreadyStaged) return null;

                          return (
                            <button key={itemId} onClick={() => handleQtyChange(itemId)} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-950/20 transition-all text-left group flex items-center justify-between">
                              <span className="font-bold text-zinc-300 text-[10px] group-hover:text-blue-400 truncate pr-2">{item.name}</span>
                              <Plus size={12} className="text-zinc-600 group-hover:text-blue-400 shrink-0" />
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
              <button onClick={handleAddNewZone} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">+ Add New Physical Shelf/Cooler</button>
            )}
          </div>

          {!isStrict && (
            <div className="pt-4 border-t border-zinc-800/50 space-y-6">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Star size={12} className="fill-amber-400" /> Frequent Stock</h3>
              <div className="grid grid-cols-2 gap-2">
                {frequentItems.map(item => (
                  <button key={item.id} onClick={() => handleQtyChange(item.id)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-500/50 hover:bg-amber-950/20 transition-all text-left flex flex-col justify-between">
                    <span className="font-bold text-zinc-300 text-sm group-hover:text-amber-400">{item.name}</span>
                    <span className="text-[9px] uppercase font-black text-zinc-600 mt-2">→ {activeLocation.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Catalog</h3>
                  <button onClick={() => setIsAddingNew(!isAddingNew)} className="text-[10px] font-black bg-zinc-800 text-cyan-400 px-2 py-1.5 rounded hover:bg-zinc-700 transition-colors flex items-center gap-1 uppercase tracking-wider">
                    {isAddingNew ? 'Cancel' : '+ New Asset'}
                  </button>
                </div>

                {isAddingNew && (
                  <form onSubmit={handleAddNewAsset} className="bg-cyan-950/20 border border-cyan-900/50 rounded-xl p-4 mb-4 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between text-cyan-400 mb-1">
                      <div className="flex items-center gap-2"><Database size={16} /> <span className="font-black text-xs uppercase tracking-widest">Digitize New Item</span></div>
                    </div>
                    <input type="text" placeholder="Item Name" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Unit" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-100" />
                      <select value={newItem.preferredVendor} onChange={e => setNewItem({...newItem, preferredVendor: e.target.value})} className="w-2/3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-bold text-zinc-300">
                        {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-cyan-500 text-zinc-950 font-black uppercase text-xs py-3 rounded-lg">Save & Inject</button>
                  </form>
                )}

                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type="text" placeholder="Search global database..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-100 focus:outline-none focus:border-cyan-500/50" />
                </div>
                
                <div className="space-y-2">
                  {standardItems.map(item => (
                    <button key={item.id} onClick={() => handleQtyChange(item.id)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/30 flex justify-between items-center group">
                      <span className="font-bold text-zinc-300 text-sm group-hover:text-cyan-400">{item.name}</span>
                      <Plus size={16} className="text-zinc-500 group-hover:text-cyan-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}