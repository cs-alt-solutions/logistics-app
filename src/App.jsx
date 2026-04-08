import React, { useState } from 'react';
import { GLOSSARY, MASTER_CATALOG } from './glossary';
import { useStickyState } from './hooks/useStickyState';
import { Gatekeeper, AppHeader } from './components/UIComponents';
import AdminCommandCenter from './components/AdminCommandCenter';
import DriverConsole from './components/DriverConsole';

export default function App() {
  const [activeRole, setActiveRole] = useState(null);
  const [catalog, setCatalog] = useStickyState(MASTER_CATALOG, 'app_catalog');
  
  // Database-ready flattened state
  const [runPhase, setRunPhase] = useStickyState(GLOSSARY.system.phases.IDLE, 'app_runPhase');
  const [runItems, setRunItems] = useStickyState([], 'app_runItems'); 
  const [rolloverQueue, setRolloverQueue] = useStickyState([], 'app_rolloverQueue');
  
  // NEW: History & Time Databases
  const [, setTimeLogs] = useStickyState([], 'app_timeLogs'); // Setter only to satisfy linter until UI is built
  const [runHistory, setRunHistory] = useStickyState([], 'app_runHistory'); 

  // LOGIC MECHANICS
  const clockInDriver = () => {
    setTimeLogs(prev => [...prev, { id: Date.now(), timestamp: new Date(), event: 'CLOCK_IN', driver: 'Driver_1' }]);
    setRunPhase(GLOSSARY.system.phases.DRIVER_CLOCK_IN);
  };

  const upsertRunItem = (itemId, locId, qty, vendor) => {
    setRunItems(prev => {
      const existing = prev.find(i => i.itemId === itemId && i.locId === locId);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, qty, vendor } : i).filter(i => i.qty > 0);
      }
      if (qty > 0) {
        return [...prev, { id: Date.now().toString() + Math.random(), itemId, locId, qty, status: GLOSSARY.system.itemStatus.PENDING, vendor }];
      }
      return prev;
    });
  };

  const updateItemStatus = (id, newStatus) => {
    setRunItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const dispatchRun = (cardPickupLocId) => {
    setRunItems(prev => [...prev, { id: 'card-chain', itemId: 'biz-card', locId: cardPickupLocId, qty: 1, status: GLOSSARY.system.itemStatus.CARD_TRANSFER, vendor: 'N/A' }]);
    setRunPhase(GLOSSARY.system.phases.SHOPPING);
  };
  
  const finishRun = () => {
    const timestamp = new Date();
    
    const completedManifest = runItems.filter(i => i.itemId !== 'biz-card'); 
    const historyEntry = {
      id: Date.now(),
      dispatchTime: runHistory.length > 0 ? runHistory[runHistory.length - 1].endTime : timestamp, 
      endTime: timestamp,
      itemsTotal: completedManifest.length,
      unitsTotal: completedManifest.reduce((acc, curr) => acc + curr.qty, 0),
      procuredUnits: completedManifest.filter(i => i.status === GLOSSARY.system.itemStatus.PROCURED || i.status === GLOSSARY.system.itemStatus.DELIVERED).reduce((acc, curr) => acc + curr.qty, 0),
      skippedUnits: completedManifest.filter(i => i.status === GLOSSARY.system.itemStatus.SKIPPED).reduce((acc, curr) => acc + curr.qty, 0),
      driver: 'Driver_1'
    };
    setRunHistory(prev => [historyEntry, ...prev]);

    const skipped = runItems.filter(i => i.status === GLOSSARY.system.itemStatus.SKIPPED);
    setRolloverQueue(prev => {
      let nextQ = [...prev];
      skipped.forEach(s => {
        const existing = nextQ.find(q => q.itemId === s.itemId && q.locId === s.locId);
        if (existing) existing.qty += s.qty;
        else nextQ.push({ itemId: s.itemId, locId: s.locId, qty: s.qty, vendor: s.vendor });
      });
      return nextQ;
    });

    setTimeLogs(prev => [...prev, { id: Date.now() + 1, timestamp: new Date(), event: 'CLOCK_OUT', driver: 'Driver_1' }]);
    setRunItems([]);
    setRunPhase(GLOSSARY.system.phases.IDLE);
  };

  if (!activeRole) return <Gatekeeper onUnlock={setActiveRole} />;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans md:py-8 relative selection:bg-cyan-500/30">
      <div className="max-w-md mx-auto bg-zinc-900 md:rounded-[2rem] md:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-x md:border-y border-zinc-800 min-h-screen md:min-h-[850px] flex flex-col relative">
        <AppHeader role={activeRole} phase={runPhase} onLogout={() => setActiveRole(null)} />

        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide relative h-full">
          {activeRole === 'admin' ? (
            <AdminCommandCenter 
              catalog={catalog} setCatalog={setCatalog} 
              runItems={runItems} upsertRunItem={upsertRunItem}
              runPhase={runPhase} setRunPhase={setRunPhase}
              rolloverQueue={rolloverQueue} setRolloverQueue={setRolloverQueue}
              dispatchRun={dispatchRun}
              runHistory={runHistory}
            />
          ) : (
            <DriverConsole 
              catalog={catalog}
              runItems={runItems}
              runPhase={runPhase} setRunPhase={setRunPhase}
              clockInDriver={clockInDriver}
              updateItemStatus={updateItemStatus}
              finishRun={finishRun}
            />
          )}
        </main>
      </div>
    </div>
  );
}