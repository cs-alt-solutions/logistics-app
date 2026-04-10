import React, { useState } from 'react';
import { Edit2, X, Plus, Star } from 'lucide-react';
import { GLOSSARY } from '../glossary';

export const EditItemModal = ({ item, catalog, onSave, onClose }) => {
  const [editedItem, setEditedItem] = useState({ ...item });
  const [flavorInput, setFlavorInput] = useState((item.flavors || []).join(', '));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedItem.name.trim()) return;
    
    const parsedFlavors = flavorInput.split(',').map(f => f.trim()).filter(f => f.length > 0);
    onSave({ ...editedItem, flavors: parsedFlavors });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <Edit2 size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <h2 className="font-black text-xl text-zinc-100 tracking-tight uppercase">Edit Catalog Item</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Core Product Name</label>
            <button type="button" onClick={() => setEditedItem({...editedItem, is_favorite: !editedItem.is_favorite})} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${editedItem.is_favorite ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
              <Star size={12} className={editedItem.is_favorite ? 'fill-amber-400' : ''} /> {editedItem.is_favorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
          <input type="text" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={editedItem.name} onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })} />
          
          {/* NEW: Flavor Input */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Flavors / Variants (Comma Separated)</label>
            <input type="text" placeholder="e.g. Regular, Diet, Cherry" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={flavorInput} onChange={(e) => setFlavorInput(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Item Size (Optional)</label>
                <input type="text" placeholder="e.g. 20 oz" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={editedItem.item_size || ''} onChange={(e) => setEditedItem({ ...editedItem, item_size: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Container Type</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={editedItem.container_type || 'None'} onChange={(e) => setEditedItem({ ...editedItem, container_type: e.target.value })}>
                  {GLOSSARY.containerTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Unit of Measure</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={editedItem.unit} onChange={(e) => setEditedItem({ ...editedItem, unit: e.target.value })}>
                  {GLOSSARY.units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={editedItem.category} onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}>
                  {GLOSSARY.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Primary Vendor</label>
            <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={editedItem.preferred_vendor} onChange={(e) => setEditedItem({ ...editedItem, preferred_vendor: e.target.value })}>
              {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Acceptable Alternatives</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {catalog.filter(c => c.id !== editedItem.id).map(catItem => {
                  const isAlt = (editedItem.alternative_ids || []).includes(catItem.id);
                  return (
                      <label key={catItem.id} className={`flex items-center gap-2 text-[10px] font-bold text-zinc-300 bg-zinc-950 p-2 rounded-lg border cursor-pointer transition-colors ${isAlt ? 'border-amber-500/50 text-amber-400' : 'border-zinc-800 hover:border-cyan-500/30'}`}>
                          <input
                            type="checkbox"
                            checked={isAlt}
                            onChange={(e) => {
                                const newAlts = e.target.checked
                                  ? [...(editedItem.alternative_ids || []), catItem.id]
                                  : (editedItem.alternative_ids || []).filter(id => id !== catItem.id);
                                setEditedItem({...editedItem, alternative_ids: newAlts});
                            }}
                            className="w-3 h-3 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950"
                          />
                          <span className="truncate">{catItem.name} {catItem.item_size}</span>
                      </label>
                  )
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Visible At Locations (Uncheck to hide)</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(GLOSSARY.locations).map(loc => {
                  const isHidden = (editedItem.excluded_locations || []).includes(loc.id);
                  return (
                      <label key={loc.id} className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800 cursor-pointer hover:border-cyan-500/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={(e) => {
                                const newExclusions = e.target.checked
                                  ? (editedItem.excluded_locations || []).filter(id => id !== loc.id)
                                  : [...(editedItem.excluded_locations || []), loc.id];
                                setEditedItem({...editedItem, excluded_locations: newExclusions});
                            }}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-950"
                          />
                          <span className="truncate">{loc.name}</span>
                      </label>
                  )
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">ABORT</button>
            <button type="submit" disabled={!editedItem.name.trim()} className="flex-1 py-3 rounded-xl font-black text-zinc-950 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:shadow-none">UPDATE ITEM</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddItemModal = ({ catalog, onSave, onClose }) => {
  const [newItem, setNewItem] = useState({ 
    name: '', 
    item_size: '',
    container_type: 'None',
    unit: GLOSSARY.units[0], 
    category: GLOSSARY.categories[0], 
    preferred_vendor: GLOSSARY.vendors[0], 
    is_favorite: false, 
    excluded_locations: [],
    alternative_ids: [],
    flavors: []
  });
  
  const [flavorInput, setFlavorInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    
    const parsedFlavors = flavorInput.split(',').map(f => f.trim()).filter(f => f.length > 0);
    onSave({ ...newItem, flavors: parsedFlavors });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <Plus size={24} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <h2 className="font-black text-xl text-zinc-100 tracking-tight uppercase">New Item</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Core Product Name</label>
            <button type="button" onClick={() => setNewItem({...newItem, is_favorite: !newItem.is_favorite})} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${newItem.is_favorite ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
              <Star size={12} className={newItem.is_favorite ? 'fill-amber-400' : ''} /> {newItem.is_favorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
          <input type="text" placeholder="e.g. Gatorade" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
          
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Flavors / Variants (Comma Separated)</label>
            <input type="text" placeholder="e.g. Red, Blue, Frost White" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={flavorInput} onChange={(e) => setFlavorInput(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Item Size (Optional)</label>
                <input type="text" placeholder="e.g. 16 oz" className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-100 transition-shadow shadow-inner" value={newItem.item_size} onChange={(e) => setNewItem({ ...newItem, item_size: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Container Type</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={newItem.container_type} onChange={(e) => setNewItem({ ...newItem, container_type: e.target.value })}>
                  {GLOSSARY.containerTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Unit of Measure</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                  {GLOSSARY.units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                  {GLOSSARY.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1 block">Primary Vendor</label>
            <select className="w-full p-3 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-zinc-300 transition-shadow shadow-inner" value={newItem.preferred_vendor} onChange={(e) => setNewItem({ ...newItem, preferred_vendor: e.target.value })}>
              {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Acceptable Alternatives</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {catalog.map(catItem => {
                  const isAlt = (newItem.alternative_ids || []).includes(catItem.id);
                  return (
                      <label key={catItem.id} className={`flex items-center gap-2 text-[10px] font-bold text-zinc-300 bg-zinc-950 p-2 rounded-lg border cursor-pointer transition-colors ${isAlt ? 'border-emerald-500/50 text-emerald-400' : 'border-zinc-800 hover:border-emerald-500/30'}`}>
                          <input
                            type="checkbox"
                            checked={isAlt}
                            onChange={(e) => {
                                const newAlts = e.target.checked
                                  ? [...(newItem.alternative_ids || []), catItem.id]
                                  : (newItem.alternative_ids || []).filter(id => id !== catItem.id);
                                setNewItem({...newItem, alternative_ids: newAlts});
                            }}
                            className="w-3 h-3 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                          />
                          <span className="truncate">{catItem.name} {catItem.item_size}</span>
                      </label>
                  )
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block">Visible At Locations (Uncheck to hide)</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(GLOSSARY.locations).map(loc => {
                  const isHidden = (newItem.excluded_locations || []).includes(loc.id);
                  return (
                      <label key={loc.id} className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800 cursor-pointer hover:border-emerald-500/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={!isHidden}
                            onChange={(e) => {
                                const newExclusions = e.target.checked
                                  ? (newItem.excluded_locations || []).filter(id => id !== loc.id)
                                  : [...(newItem.excluded_locations || []), loc.id];
                                setNewItem({...newItem, excluded_locations: newExclusions});
                            }}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                          />
                          <span className="truncate">{loc.name}</span>
                      </label>
                  )
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 transition-colors border border-zinc-700">ABORT</button>
            <button type="submit" disabled={!newItem.name.trim()} className="flex-1 py-3 rounded-xl font-black text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none">CREATE ITEM</button>
          </div>
        </form>
      </div>
    </div>
  );
};