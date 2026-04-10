import React from 'react';
import { CheckSquare, Database } from 'lucide-react';

export default function RunHistory({ runHistory }) {
  return (
    <div className="p-4 flex-1 space-y-4 animate-in slide-in-from-top-4">
      <h2 className="text-xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-2 mb-6">
        <CheckSquare size={20}/> Completed Run History
      </h2>
      {runHistory?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
          <Database size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-bold">No runs recorded in history database yet.</p>
        </div>
      ) : (
        runHistory.map(run => (
          <div key={run.id} className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-md overflow-hidden transition-all hover:border-zinc-700">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-100 font-black text-lg">Completed Run</span>
                <span className="text-zinc-600 font-bold text-xs tabular-nums">{new Date(run.end_time).toLocaleDateString()}</span>
              </div>
              <p className="text-xs font-bold text-zinc-400">Dispatch: {new Date(run.dispatch_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}