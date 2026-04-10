import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { GLOSSARY } from '../../glossary';
import { Layers, Edit3, Save, Trash2, X, PlusCircle, Plus, Search, ChevronDown, ChevronRight, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const generateZoneId = () => `zone-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function PlanogramManager({ catalog, activeLocation, activeLocRunItems, upsertRunItem, refreshData, setIsAddingItem }) {
  const [isManagingLayout, setIsManagingLayout] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [tempGroupName, setTempGroupName] = useState("");
  const [activeSlot, setActiveSlot] = useState({ zoneId: null, index: null });
  const [sourceSlot, setSourceSlot] = useState(null); 
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const locationZones = activeLocation?.zones || [];

  const groupedZones = locationZones.reduce((acc, zone) => {
    const group = zone.group_name || 'Main Cooler';
    if (!acc[group]) acc[group] = [];
    acc[group].push(zone);
    return acc;
  }, {});

  Object.keys(groupedZones).forEach(key => {
      groupedZones[key].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  });

  const toggleGroup = (group) => setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const handleQtyChange = (itemId) => {
    const item = catalog.find(c => c.id === itemId);
    upsertRunItem(itemId, activeLocation.id, 1, item?.preferred_vendor || GLOSSARY.defaultVendor); 
  };

  const handleAddNewCooler = async () => {
    const newId = generateZoneId(); 
    const newGroupName = `Cooler ${Object.keys(groupedZones).length + 1}`;
    await supabase.from('location_zones').insert([{
      id: newId,
      location_id: activeLocation.id,
      name: 'Shelf',
      group_name: newGroupName,
      zone_type: 'Fixed',
      item_ids: [],
      slot_count: 6,
      order_index: 0
    }]);
    if (refreshData) refreshData();
  };

  const handleAddNewShelf = async (groupName) => {
    const newId = generateZoneId(); 
    const shelvesInGroup = groupedZones[groupName]?.length || 0;
    await supabase.from('location_zones').insert([{
      id: newId,
      location_id: activeLocation.id,
      name: `Shelf`,
      group_name: groupName,
      zone_type: 'Fixed',
      item_ids: [],
      slot_count: 6,
      order_index: shelvesInGroup
    }]);
    if (refreshData) refreshData();
  };

  const updateZoneType = async (zoneId, newType) => {
      await supabase.from('location_zones').update({zone_type: newType}).eq('id', zoneId);
      if (refreshData) refreshData();
  };

  const moveShelf = async (zone, direction, sortedZonesArray, currentIndex) => {
      if (direction === -1 && currentIndex > 0) {
          const swapZone = sortedZonesArray[currentIndex - 1];
          await supabase.from('location_zones').update({order_index: currentIndex - 1}).eq('id', zone.id);
          await supabase.from('location_zones').update({order_index: currentIndex}).eq('id', swapZone.id);
      } else if (direction === 1 && currentIndex < sortedZonesArray.length - 1) {
          const swapZone = sortedZonesArray[currentIndex + 1];
          await supabase.from('location_zones').update({order_index: currentIndex + 1}).eq('id', zone.id);
          await supabase.from('location_zones').update({order_index: currentIndex}).eq('id', swapZone.id);
      }
      if (refreshData) refreshData();
  };

  const handleDeleteGroup = async (groupName) => {
    if (!window.confirm(`Are you sure you want to delete ${groupName} and all its shelves?`)) return;
    await supabase.from('location_zones').delete().eq('group_name', groupName).eq('location_id', activeLocation.id);
    if (refreshData) refreshData();
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this shelf?")) return;
    await supabase.from('location_zones').delete().eq('id', zoneId);
    if (refreshData) refreshData();
  };

  const saveGroupEdit = async (oldName) => {
    if (tempGroupName && tempGroupName !== oldName) {
      await supabase.from('location_zones').update({ group_name: tempGroupName }).eq('group_name', oldName).eq('location_id', activeLocation.id);
    }
    setEditingGroup(null);
    if (refreshData) refreshData();
  };

  const handleSlotClick = (zone, index, itemId) => {
      if (!isManagingLayout) return;
      if (!sourceSlot) {
          if (itemId && itemId !== "") {
              setSourceSlot({ zoneId: zone.id, index, itemId });
              setActiveSlot({ zoneId: null, index: null });
          } else {
              setActiveSlot({ zoneId: zone.id, index }); 
          }
      } else {
          executeSwap(sourceSlot, { zoneId: zone.id, index, itemId });
      }
  };

  const executeSwap = async (src, dest) => {
      if (src.zoneId === dest.zoneId && src.index === dest.index) {
          setSourceSlot(null); 
          return; 
      }
      if (src.zoneId === dest.zoneId) {
          const zone = locationZones.find(z => z.id === src.zoneId);
          const newIds = [...(zone.item_ids || [])];
          while(newIds.length <= Math.max(src.index, dest.index)) newIds.push(""); 
          newIds[src.index] = dest.itemId || "";
          newIds[dest.index] = src.itemId || "";
          await supabase.from('location_zones').update({item_ids: newIds}).eq('id', zone.id);
      } else {
          const srcZone = locationZones.find(z => z.id === src.zoneId);
          const destZone = locationZones.find(z => z.id === dest.zoneId);
          const newSrcIds = [...(srcZone.item_ids || [])];
          while(newSrcIds.length <= src.index) newSrcIds.push("");
          newSrcIds[src.index] = dest.itemId || "";
          const newDestIds = [...(destZone.item_ids || [])];
          while(newDestIds.length <= dest.index) newDestIds.push("");
          newDestIds[dest.index] = src.itemId || "";
          await supabase.from('location_zones').update({item_ids: newSrcIds}).eq('id', srcZone.id);
          await supabase.from('location_zones').update({item_ids: newDestIds}).eq('id', destZone.id);
      }
      setSourceSlot(null);
      if (refreshData) refreshData();
  };

  const assignItemToSlot = async (zone, index, itemId) => {
    let currentIds = [...(zone.item_ids || [])];
    while (currentIds.length <= index) currentIds.push("");
    currentIds[index] = itemId;
    await supabase.from('location_zones').update({ item_ids: currentIds }).eq('id', zone.id);
    setActiveSlot({ zoneId: null, index: null });
    setSlotSearchQuery("");
    if (refreshData) refreshData();
  };

  const clearSlot = async (zone, index, e) => {
    e.stopPropagation(); 
    let currentIds = [...(zone.item_ids || [])];
    while (currentIds.length <= index) currentIds.push("");
    currentIds[index] = ""; 
    await supabase.from('location_zones').update({ item_ids: currentIds }).eq('id', zone.id);
    if (sourceSlot?.zoneId === zone.id && sourceSlot?.index === index) setSourceSlot(null);
    if (refreshData) refreshData();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeLocation?.theme?.text || 'text-cyan-400'}`}>
            <Layers size={14} /> Physical Planogram
        </h3>
        <button onClick={() => { setIsManagingLayout(!isManagingLayout); setActiveSlot({zoneId: null, index: null}); setSourceSlot(null); }} className={`text-[10px] font-black px-2 py-1 rounded transition-colors uppercase ${isManagingLayout ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
          {isManagingLayout ? 'Stop Editing' : 'Edit Planogram'}
        </button>
      </div>

      {isManagingLayout && sourceSlot && (
         <div className="bg-amber-500/20 border border-amber-500/50 p-2 rounded-lg flex items-center justify-between animate-in fade-in zoom-in-95">
             <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                 <RefreshCw size={14} className="animate-spin-slow" /> Select another slot to swap or move
             </div>
             <button onClick={() => setSourceSlot(null)} className="text-zinc-400 hover:text-rose-400 px-2"><X size={14}/></button>
         </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedZones).map(([groupName, zones]) => {
          const isCollapsed = collapsedGroups[groupName];
          const isGroupEditing = editingGroup === groupName;
          return (
            <div key={groupName} className="bg-zinc-950/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className={`px-4 py-3 flex items-center justify-between border-b border-zinc-800 transition-colors ${isCollapsed ? 'bg-zinc-900/50' : activeLocation?.theme?.bgLight || 'bg-zinc-900'}`}>
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => !isGroupEditing && toggleGroup(groupName)}>
                  {isCollapsed ? <ChevronRight size={16} className="text-zinc-500" /> : <ChevronDown size={16} className={activeLocation?.theme?.text} />}
                  {isGroupEditing ? (
                    <input value={tempGroupName} onChange={e => setTempGroupName(e.target.value)} onClick={e => e.stopPropagation()} className="bg-zinc-950 border border-cyan-500/50 text-zinc-100 text-sm font-black px-2 py-1 rounded w-2/3 uppercase tracking-wider" autoFocus />
                  ) : (
                    <span className={`font-black text-sm uppercase tracking-widest ${activeLocation?.theme?.text || 'text-cyan-400'}`}>{groupName}</span>
                  )}
                </div>
                {isManagingLayout && (
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {isGroupEditing ? <button onClick={() => saveGroupEdit(groupName)} className="text-emerald-400 hover:scale-110 transition-transform"><Save size={16}/></button> : <button onClick={() => { setEditingGroup(groupName); setTempGroupName(groupName); }} className="text-zinc-500 hover:text-cyan-400"><Edit3 size={16}/></button>}
                    <button onClick={() => handleDeleteGroup(groupName)} className="text-zinc-700 hover:text-rose-500"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="p-3 space-y-4">
                  {zones.map((zone, shelfIndex) => {
                    const slotCount = zone.slot_count || 6;
                    const itemIds = zone.item_ids || [];
                    const slots = Array.from({ length: slotCount });
                    const isInterchangeable = zone.zone_type === 'Interchangeable';
                    return (
                      <div key={zone.id} className={`border rounded-xl overflow-hidden shadow-sm transition-colors ${isInterchangeable ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-zinc-900/40 border-zinc-800'}`}>
                        <div className={`px-2 py-1 border-b flex items-center justify-between ${isInterchangeable ? 'bg-indigo-950/40 border-indigo-900/50' : 'bg-zinc-950/30 border-zinc-800/50'}`}>
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-[9px] text-zinc-500 uppercase tracking-widest">Shelf {shelfIndex + 1}</span>
                             {isInterchangeable && <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase border border-indigo-500/30">Flex Zone</span>}
                           </div>
                           {isManagingLayout && (
                             <div className="flex items-center gap-2">
                                <select value={zone.zone_type || 'Fixed'} onChange={(e) => updateZoneType(zone.id, e.target.value)} className="bg-zinc-900 text-[9px] text-zinc-400 border border-zinc-700 rounded outline-none p-0.5 uppercase font-bold mr-2">
                                    <option value="Fixed">Fixed</option>
                                    <option value="Interchangeable">Flex</option>
                                    <option value="Promo">Promo</option>
                                </select>
                                <button onClick={() => moveShelf(zone, -1, zones, shelfIndex)} disabled={shelfIndex === 0} className="text-zinc-500 hover:text-cyan-400 disabled:opacity-20"><ArrowUp size={12}/></button>
                                <button onClick={() => moveShelf(zone, 1, zones, shelfIndex)} disabled={shelfIndex === zones.length - 1} className="text-zinc-500 hover:text-cyan-400 disabled:opacity-20"><ArrowDown size={12}/></button>
                                <button onClick={() => handleDeleteZone(zone.id)} className="text-zinc-600 hover:text-rose-500 ml-2 border-l border-zinc-700 pl-2"><X size={12}/></button>
                             </div>
                           )}
                        </div>
                        <div className={`p-2 ${isInterchangeable ? 'bg-indigo-900/10' : 'bg-zinc-900/20'}`}>
                           <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))` }}>
                             {slots.map((_, index) => {
                               const itemId = itemIds[index];
                               const item = (itemId && itemId !== "") ? catalog.find(c => c.id === itemId) : null;
                               const isAlreadyStaged = item ? activeLocRunItems.find(ri => ri.item_id === itemId) : false;
                               const isSelectingForThisSlot = activeSlot.zoneId === zone.id && activeSlot.index === index;
                               const isThisTheSourceMove = sourceSlot?.zoneId === zone.id && sourceSlot?.index === index;
                               if (isManagingLayout) {
                                 return (
                                   <div key={index} className={`relative flex flex-col items-center justify-center text-center p-1 rounded border-2 h-16 transition-all cursor-pointer ${isThisTheSourceMove ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse' : isSelectingForThisSlot ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : item ? 'border-zinc-700 bg-zinc-800 hover:border-amber-500/50' : 'border-dashed border-zinc-700 hover:border-zinc-400'}`} onClick={() => handleSlotClick(zone, index, itemId)}>
                                      {item ? <>
                                          <span className="text-[8px] font-bold text-zinc-300 leading-tight">{item.name}</span>
                                          {(item.item_size || (item.flavors && item.flavors.length > 0)) && <span className="text-[7px] text-zinc-500 uppercase mt-0.5">{item.item_size} {item.flavors && item.flavors.length > 0 ? `(${item.flavors.length} var)` : ''}</span>}
                                          <button onClick={(e) => clearSlot(zone, index, e)} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:scale-110 shadow-md"><X size={10} /></button>
                                      </> : <PlusCircle size={14} className={(isSelectingForThisSlot || sourceSlot) ? 'text-cyan-400' : 'text-zinc-600'} />}
                                   </div>
                                 );
                               }
                               return (
                                 <div key={index} className="flex flex-col h-full">
                                    {item ? <button disabled={isAlreadyStaged} onClick={() => handleQtyChange(itemId)} className={`flex flex-col items-center justify-center text-center p-1 rounded border h-16 transition-all group ${isAlreadyStaged ? 'bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed' : 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:bg-blue-950/30 shadow-sm'}`}>
                                          <span className="text-[8px] font-bold text-zinc-300 leading-tight group-hover:text-blue-400">{item.name}</span>
                                          {(item.item_size || (item.flavors && item.flavors.length > 0)) && <span className="text-[7px] text-zinc-500 uppercase mt-0.5">{item.item_size}</span>}
                                          {!isAlreadyStaged && <Plus size={10} className="text-zinc-500 group-hover:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                     </button> : <div className="flex items-center justify-center h-16 bg-zinc-950/50 border border-zinc-800 rounded opacity-40"></div>}
                                 </div>
                               );
                             })}
                           </div>
                           {isManagingLayout && activeSlot.zoneId === zone.id && (
                             <div className="mt-3 p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl animate-in slide-in-from-top-2 shadow-lg relative z-10">
                               <div className="flex items-center justify-between mb-2">
                                 <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Assign Slot {activeSlot.index + 1}</label>
                                 <button onClick={() => setActiveSlot({zoneId: null, index: null})} className="text-zinc-500 hover:text-rose-400"><X size={14}/></button>
                               </div>
                               <div className="relative mb-2">
                                 <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
                                 <input placeholder="Search catalog..." value={slotSearchQuery} onChange={e => setSlotSearchQuery(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-bold pl-8 text-zinc-100 focus:border-cyan-500 outline-none" autoFocus />
                               </div>
                               <div className="max-h-32 overflow-y-auto space-y-1 pr-1 grid grid-cols-2 gap-1 mb-2">
                                  {catalog.filter(i => i.name.toLowerCase().includes(slotSearchQuery.toLowerCase())).map(item => (
                                      <button key={item.id} onClick={() => assignItemToSlot(zone, activeSlot.index, item.id)} className="w-full text-left p-2 rounded-lg text-[10px] font-bold flex items-center justify-between border bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 transition-all">
                                        <span className="truncate pr-2">{item.name} {item.item_size}</span> <Plus size={10} className="shrink-0" />
                                      </button>
                                  ))}
                               </div>
                               <button onClick={() => setIsAddingItem(true)} className="w-full py-2 border border-dashed border-emerald-500/50 text-emerald-400 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-950/30 hover:border-emerald-400 transition-colors flex items-center justify-center gap-1"><Plus size={12} /> Create New Catalog Item</button>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                  {isManagingLayout && <button onClick={() => handleAddNewShelf(groupName)} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">+ Add Shelf to {groupName}</button>}
                </div>
              )}
            </div>
          );
        })}
        {isManagingLayout && <button onClick={handleAddNewCooler} className="w-full py-4 border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl text-[11px] font-black uppercase text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">+ Add New Cooler / Section</button>}
      </div>
    </>
  );
}