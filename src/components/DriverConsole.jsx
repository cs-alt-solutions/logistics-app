import React, { useState, useEffect } from 'react';
import { GLOSSARY } from '../glossary';
import { Check, X, Package, ArrowRight, MapPin, Clock, CreditCard, ChevronDown, Calendar, CheckCircle } from 'lucide-react';
import { useStickyState } from '../hooks/useStickyState';

const getOrdinal = (n) => {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
};

const formatDateWithOrdinal = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = d.getDate();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${weekday}, ${month} ${day}${getOrdinal(day)} ${year}`;
};

const ShiftBanner = ({ shiftStart }) => {
  if (!shiftStart) return null;
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between shadow-md z-30 sticky top-0">
      <div className="flex items-center gap-3 text-cyan-400">
        <Clock size={18} className="animate-pulse opacity-80" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Shift Started</span>
          <span className="text-xs font-bold text-zinc-200">
            {formatDateWithOrdinal(shiftStart)} • {new Date(shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function DriverConsole({ catalog, runItems, runPhase, setRunPhase, clockInDriver, updateItemStatus, updateLocationItemsStatus, finishRun }) {
  const [activeVendor, setActiveVendor] = useState(GLOSSARY.vendors[0]);
  const [now, setNow] = useState(new Date());
  const [shiftStart, setShiftStart] = useStickyState(null, 'app_driverShiftStart');
  const [finalCardLocId, setFinalCardLocId] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setShiftStart(new Date().toISOString());
    clockInDriver();
  };

  const handleCompleteRun = () => {
    if (!finalCardLocId) return;
    setShiftStart(null); 
    setFinalCardLocId(""); 
    finishRun(finalCardLocId);
  };

  const handleLocationDelivered = (locId) => {
    if (updateLocationItemsStatus) {
       updateLocationItemsStatus(locId, GLOSSARY.system.itemStatus.DELIVERED);
    }
  };

  if (runPhase === GLOSSARY.system.phases.IDLE) {
    return (
      <div className="p-6 flex flex-col h-full items-center justify-center space-y-12 bg-zinc-950 font-sans relative overflow-hidden">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/10 to-zinc-950 pointer-events-none"></div>
        <div className="z-10 text-center space-y-4">
            <Package size={60} className="text-zinc-800 mx-auto" />
            <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tight">{GLOSSARY.appTitle}</h1>
            <p className="text-cyan-500/70 font-bold uppercase tracking-widest text-xs">Driver Console v0.1</p>
        </div>
        <div className="z-10 text-center space-y-2 border border-zinc-800 bg-zinc-900 p-6 rounded-3xl shadow-lg min-w-[280px]">
            <div className="flex items-center justify-center gap-2 text-cyan-400 mb-1">
              <Calendar size={16} />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-300">{formatDateWithOrdinal(now)}</span>
            </div>
            <div className="text-5xl font-mono text-zinc-100 tabular-nums tracking-tight font-black">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
        <button onClick={handleClockIn} className="z-10 w-full max-w-sm bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black uppercase py-5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3 transition-all transform active:scale-95 text-lg">
          <Clock size={22} /> Start Day / Clock In
        </button>
      </div>
    );
  }

  if (runPhase === GLOSSARY.system.phases.DRIVER_CLOCK_IN) {
    return (
        <div className="flex flex-col h-full">
            <ShiftBanner shiftStart={shiftStart} />
            <div className="p-8 text-center flex flex-col items-center justify-center flex-1 space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-6 rounded-full text-emerald-400 animate-pulse"><Check size={40}/></div>
                <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">You're Clocked In!</h2>
                <p className="text-zinc-500 font-bold mt-2 max-w-xs">Awaiting dispatch of your manifest from the Admin Command Center. Refreshing live...</p>
            </div>
        </div>
    );
  }

  if (runPhase === GLOSSARY.system.phases.SHOPPING) {
    const pendingItems = runItems.filter(i => i.status === GLOSSARY.system.itemStatus.PENDING && i.item_id !== 'biz-card');
    const pendingTotal = pendingItems.length;
    const cardTransfer = runItems.find(i => i.item_id === 'biz-card');
    const cardLoc = Object.values(GLOSSARY.locations).find(l => l.id === cardTransfer?.loc_id);

    return (
      <div className="flex flex-col h-full animate-in fade-in relative">
        <ShiftBanner shiftStart={shiftStart} />
        
        <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-[57px] z-20 shadow-lg">
          <div className={`${cardLoc?.theme.bgLight} ${cardLoc?.theme.border} border-b px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                  <CreditCard size={28} className={cardLoc?.theme.text} />
                  <div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Required Action</span>
                      <h3 className={`font-black text-sm uppercase tracking-tight ${cardLoc?.theme.text}`}>Pickup Business Card: <span className="text-zinc-100">{cardLoc?.name}</span></h3>
                  </div>
              </div>
          </div>
          <div className="p-4 bg-zinc-950">
            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Live Status: Updating location to Admin console
            </label>
            <div className="relative">
                <select value={activeVendor} onChange={(e) => setActiveVendor(e.target.value)} className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-cyan-400 font-black text-base focus:ring-2 focus:ring-cyan-500 outline-none appearance-none">
                {GLOSSARY.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto pb-24">
          {pendingTotal === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
              <Check size={32} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-black text-zinc-400 uppercase">All Items Procured</p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-[117px]">
              {pendingItems.map(item => {
                const catItem = catalog.find(c => c.id === item.item_id);
                const loc = Object.values(GLOSSARY.locations).find(l => l.id === item.loc_id);
                return (
                  <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3.5 shadow-sm flex items-center justify-between transition-all group active:scale-[0.98]">
                    <div className="flex-1 pr-3 space-y-1">
                      <h3 className="font-bold text-zinc-100 text-base leading-tight">{catItem?.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className="font-black text-cyan-400 text-xs px-2 py-1 bg-cyan-950/40 rounded border border-cyan-500/30 tabular-nums">{item.qty} {catItem?.unit}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{catItem?.preferred_vendor}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${loc?.theme.bgLight} ${loc?.theme.border} ${loc?.theme.text}`}>{loc?.name}</span>
                      </div>
                      
                      {/* NEW: Explicitly rendering flavors to the driver */}
                      {(catItem?.item_size || (catItem?.flavors && catItem.flavors.length > 0)) && (
                         <div className="mt-2 bg-zinc-900 border border-zinc-700 p-2 rounded-lg">
                            {catItem.item_size && <div className="text-[10px] font-black text-zinc-400 uppercase">Size: {catItem.item_size} {catItem.container_type !== 'None' ? catItem.container_type : ''}</div>}
                            {catItem.flavors && catItem.flavors.length > 0 && <div className="text-[10px] font-bold text-amber-400 mt-0.5 leading-tight">Acceptable Flavors: {catItem.flavors.join(', ')}</div>}
                         </div>
                      )}
                    </div>
                    <div className="flex gap-2.5 ml-2">
                      <button onClick={() => updateItemStatus(item.id, GLOSSARY.system.itemStatus.SKIPPED)} className="p-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-500/50 transition-all flex items-center justify-center"><X size={18} /></button>
                      <button onClick={() => updateItemStatus(item.id, GLOSSARY.system.itemStatus.PROCURED)} className="p-3 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center justify-center"><Check size={18} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-800 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4">
          <button disabled={pendingTotal > 0} onClick={() => setRunPhase(GLOSSARY.system.phases.DELIVERING)} className={`w-full py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all text-base ${pendingTotal === 0 ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}>
            {pendingTotal > 0 ? `${pendingTotal} Items Remaining` : 'Proceed to Drop-offs'} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (runPhase === GLOSSARY.system.phases.DELIVERING) {
    const allDeliveryItems = runItems.filter(i => (i.status === GLOSSARY.system.itemStatus.PROCURED || i.status === GLOSSARY.system.itemStatus.DELIVERED) && i.item_id !== 'biz-card');
    const isAllDroppedOff = allDeliveryItems.every(i => i.status === GLOSSARY.system.itemStatus.DELIVERED);

    return (
      <div className="flex flex-col h-full animate-in fade-in relative">
         <ShiftBanner shiftStart={shiftStart} />
         
         <div className="flex-1 p-4 overflow-y-auto pb-32">
           <h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest mt-2 pt-[60px]">Route Drop-offs</h2>
           
           {allDeliveryItems.length === 0 && (
             <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-2xl animate-in slide-in-from-bottom-4 space-y-3 shadow-lg mt-4 mb-4">
               <p className="text-sm text-rose-400 font-bold text-center">All items were skipped on this run. Please proceed to the final step to clock out.</p>
             </div>
           )}

           <div className="space-y-5">
             {Object.values(GLOSSARY.locations).map(loc => {
               const locItems = allDeliveryItems.filter(i => i.loc_id === loc.id);
               if (locItems.length === 0) return null;
               
               const isLocComplete = locItems.every(i => i.status === GLOSSARY.system.itemStatus.DELIVERED);
               
               return (
                 <div key={loc.id} className={`rounded-2xl border overflow-hidden shadow-lg animate-in zoom-in-95 transition-all ${isLocComplete ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-zinc-800 border-zinc-700'}`}>
                   <div className={`${isLocComplete ? 'bg-emerald-900/30' : 'bg-zinc-900/50'} px-4 py-3 border-b border-zinc-700 flex items-center gap-3`}>
                     <loc.icon size={18} className={isLocComplete ? 'text-emerald-500' : loc.theme.text} />
                     <h3 className={`font-black uppercase text-sm tracking-tight ${isLocComplete ? 'text-emerald-400' : 'text-zinc-100'}`}>{loc.name}</h3>
                     {isLocComplete && <CheckCircle size={16} className="text-emerald-500 ml-auto" />}
                   </div>
                   
                   <div className="p-2.5 space-y-0.5">
                     {locItems.map(item => {
                       const catItem = catalog.find(c => c.id === item.item_id);
                       return (
                         <div key={item.id} className={`flex items-center justify-between p-2.5 border-b border-zinc-700/30 last:border-0 ${isLocComplete ? 'opacity-50' : ''}`}>
                           <div className="flex flex-col">
                             <span className="font-bold text-zinc-200 text-sm">{catItem?.name}</span>
                             {catItem?.item_size && <span className="text-[9px] text-zinc-500 uppercase">{catItem.item_size}</span>}
                           </div>
                           <span className="font-black text-sm px-3 py-1 rounded-lg bg-zinc-900 text-cyan-400 border border-zinc-700 tabular-nums">{item.qty}x</span>
                         </div>
                       );
                     })}
                   </div>

                   {!isLocComplete && (
                     <div className="p-3 bg-zinc-900/80 border-t border-zinc-700">
                       <button onClick={() => handleLocationDelivered(loc.id)} className="w-full bg-zinc-800 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-500/50 font-black uppercase text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                         <MapPin size={14} /> Mark {loc.name} Dropped Off
                       </button>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>

           {isAllDroppedOff && (
             <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-2xl animate-in slide-in-from-bottom-4 space-y-3 shadow-lg mt-8">
               <div className="flex items-center gap-3 text-amber-400 mb-2">
                 <CreditCard size={24} />
                 <h3 className="font-black uppercase tracking-tight text-sm">Final Step: Card Drop-off</h3>
               </div>
               <p className="text-xs text-zinc-400 font-bold mb-1">Select where you are returning the business card:</p>
               <select value={finalCardLocId} onChange={(e) => setFinalCardLocId(e.target.value)} className="w-full bg-zinc-950 border border-amber-900/50 rounded-lg p-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-amber-500/50">
                  <option value="" disabled>-- Select Drop-off Location --</option>
                  {Object.values(GLOSSARY.locations).map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
               </select>
             </div>
           )}
         </div>

         <div className="p-4 bg-zinc-950 border-t border-zinc-800 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <button disabled={!finalCardLocId} onClick={handleCompleteRun} className={`w-full font-black uppercase py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${finalCardLocId ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'}`}>
               Complete Run / End Day <CheckCircle size={20} />
            </button>
         </div>
      </div>
    );
  }
}