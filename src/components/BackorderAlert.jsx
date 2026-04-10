import React from 'react';
import { AlertTriangle, PlusCircle, XCircle } from 'lucide-react';

export default function BackorderAlert({ backorders, catalog, locations, onResolve }) {
  if (!backorders || backorders.length === 0) return null;

  return (
    <div className="p-4 mx-3 mt-3 bg-amber-950/30 border border-amber-500/50 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-lg">
       <h3 className="text-amber-400 font-black text-sm uppercase flex items-center gap-2 mb-3 tracking-widest">
         <AlertTriangle size={16} /> Action Required: Skipped Items ({backorders.length})
       </h3>
       <p className="text-[10px] text-amber-500/70 font-bold uppercase mb-3 leading-tight">These items were marked 'SKIPPED' on a previous run. Rollover to current draft or dismiss.</p>
       <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
         {backorders.map(item => {
           const catItem = catalog.find(c => c.id === item.item_id);
           const loc = locations[item.loc_id] || Object.values(locations).find(l => l.id === item.loc_id);
           return (
             <div key={item.id} className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-amber-900/50 shadow-sm">
                <div>
                  <div className="font-bold text-zinc-100 text-sm leading-tight">{catItem?.name} <span className="text-amber-500 font-black ml-1 tabular-nums">x{item.qty}</span></div>
                  <div className="text-[10px] font-black uppercase text-zinc-500 mt-1 tracking-wider">Dest: {loc?.name}</div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => onResolve(item, 'DISMISS')} className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/50 rounded-lg transition-all" title="Dismiss from Queue"><XCircle size={18} /></button>
                   <button onClick={() => onResolve(item, 'ROLLOVER')} className="p-2.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-all border border-amber-500/30" title="Rollover to active draft"><PlusCircle size={18} /></button>
                </div>
             </div>
           )
         })}
       </div>
    </div>
  )
}