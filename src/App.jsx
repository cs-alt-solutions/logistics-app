import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { GLOSSARY } from './glossary';
import { Gatekeeper, AppHeader } from './components/UIComponents';
import AdminCommandCenter from './components/AdminCommandCenter';
import DriverConsole from './components/DriverConsole';

export default function App() {
  const [activeRole, setActiveRole] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [locations, setLocations] = useState(GLOSSARY.locations); // Fallback to glossary
  const [runPhase, setRunPhase] = useState(GLOSSARY.system.phases.IDLE);
  const [runItems, setRunItems] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: cat } = await supabase.from('catalog_items').select('*');
      const { data: locs } = await supabase.from('locations').select('*, location_zones(*)');
      const { data: activeRun } = await supabase.from('runs')
        .select('*, run_items(*)')
        .neq('phase', 'IDLE')
        .limit(1)
        .maybeSingle();
      const { data: history } = await supabase.from('runs').select('*, run_items(*)').eq('phase', 'IDLE');

      if (cat) setCatalog(cat);
      if (locs && locs.length > 0) {
        const locMap = {};
        locs.forEach(l => { locMap[l.id] = { ...l, zones: l.location_zones }; });
        setLocations(locMap);
      }
      if (activeRun) {
        setRunPhase(activeRun.phase);
        setRunItems(activeRun.run_items || []);
      }
      if (history) setRunHistory(history);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-logistics')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const upsertRunItem = async (itemId, locId, qty, vendor) => {
    const { data: activeRun } = await supabase.from('runs').select('id').neq('phase', 'IDLE').maybeSingle();
    let runId = activeRun?.id;

    if (!runId) {
      const { data: newRun } = await supabase.from('runs').insert([{ phase: 'PLANNING' }]).select().single();
      runId = newRun.id;
      setRunPhase('PLANNING');
    }

    await supabase.from('run_items').upsert({
      run_id: runId,
      item_id: itemId,
      loc_id: locId,
      qty: qty,
      vendor: vendor,
      status: 'PENDING'
    }, { onConflict: 'run_id, item_id, loc_id' });
  };

  const dispatchRun = async (cardLocId) => {
    const { data: activeRun } = await supabase.from('runs').select('id').neq('phase', 'IDLE').single();
    await supabase.from('runs').update({ phase: 'SHOPPING', dispatch_time: new Date(), card_pickup_loc_id: cardLocId }).eq('id', activeRun.id);
    await supabase.from('run_items').insert([{ run_id: activeRun.id, item_id: 'biz-card', loc_id: cardLocId, qty: 1, status: 'CARD_TRANSFER' }]);
  };

  if (!activeRole) return <Gatekeeper onUnlock={setActiveRole} />;
  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-cyan-400 font-black uppercase">Loading Database...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-zinc-900 border-x border-zinc-800 min-h-screen flex flex-col relative overflow-hidden">
        <AppHeader role={activeRole} phase={runPhase} onLogout={() => setActiveRole(null)} />
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {activeRole === 'admin' ? (
            <AdminCommandCenter 
              catalog={catalog} locations={locations} setLocations={setLocations}
              runItems={runItems} upsertRunItem={upsertRunItem}
              runPhase={runPhase} setRunPhase={setRunPhase}
              dispatchRun={dispatchRun} runHistory={runHistory}
            />
          ) : (
            <DriverConsole 
              catalog={catalog} runItems={runItems} runPhase={runPhase} 
              updateItemStatus={(id, stat) => supabase.from('run_items').update({ status: stat }).eq('id', id)}
              finishRun={(loc) => supabase.from('runs').update({ phase: 'IDLE', end_time: new Date(), card_dropoff_loc_id: loc }).neq('phase', 'IDLE')}
            />
          )}
        </main>
      </div>
    </div>
  );
}