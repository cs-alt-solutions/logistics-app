import React, { useState } from 'react';
import { Lock, X, Truck, Edit2, Minus, Plus, Star } from 'lucide-react';
import { GLOSSARY } from '../glossary';

export const Gatekeeper = ({ onUnlock }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [pinAccepted, setPinAccepted] = useState(false);

  const handleKeyPress = (num) => {
    setError(false);
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        if (newInput === GLOSSARY.security.pin) {
          setPinAccepted(true);
        } else {
          setError(true);
          setTimeout(() => setInput(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
    setError(false);
  };

  if (pinAccepted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative">
        <h2 className="text-2xl font-black mb-8 tracking-widest uppercase">Select Authorization</h2>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {Object.values(GLOSSARY.security.roles).map(role => (
            <button 
              key={role.id} 
              onClick={() => onUnlock(role.id)}
              className="flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-700 p-6 rounded-2xl hover:bg-zinc-800 hover:border-cyan-500/50 transition-all text-zinc-300 hover:text-cyan-400 font-bold uppercase tracking-wider"
            >
              <role.icon size={24} /> {role.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/20 to-zinc-950 pointer-events-none"></div>
      <div className="z-10 w-full max-w-xs flex flex-col items-center">
        <div className="bg-zinc-900 p-4 rounded-2xl mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-zinc-800">
          <Lock size={40} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <h1 className="text-2xl font-black tracking-widest mb-1 text-center text-zinc-100">{GLOSSARY.appTitle.toUpperCase()}</h1>
        <p className="text-cyan-500/70 text-sm font-semibold tracking-wide mb-10 uppercase">{GLOSSARY.security.lockedMessage}</p>
        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${error ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : input.length > i ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'bg-zinc-800 border border-zinc-700'}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handleKeyPress(num.toString())} className="bg-zinc-900 hover:bg-zinc-800 text-2xl font-bold py-5 rounded-2xl transition-colors active:scale-95 border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/30">{num}</button>
          ))}
          <div className="col-start-2">
            <button onClick={() => handleKeyPress("0")} className="w-full bg-zinc-900 hover:bg-zinc-800 text-2xl font-bold py-5 rounded-2xl transition-colors active:scale-95 border border-zinc-800 text-zinc-300 hover:text-cyan-400 hover:border-cyan-500/30">0</button>
          </div>
          <div className="col-start-3">
            <button onClick={handleDelete} disabled={input.length === 0} className="w-full h-full flex items-center justify-center text-zinc-600 hover:text-rose-500 transition-colors active:scale-95"><X size={28} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppHeader = ({ role, phase, onLogout }) => (
  <header className="bg-zinc-950 text-zinc-100 p-4 flex items-center justify-between border-b border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative z-20">
    <div className="flex items-center gap-3">
      <Truck size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      <div>
        <h1 className="font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 uppercase leading-none">{GLOSSARY.appTitle}</h1>
        <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">{role === 'admin' ? 'Command' : 'Console'} • {phase}</span>
      </div>
    </div>
    <button onClick={onLogout} className="text-zinc-500 hover:text-rose-400 transition-colors">
      <X size={20} />
    </button>
  </header>
);

export const CatalogRow = ({ item, quantity, onAdd, onRemove, onEdit }) => (
  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-800 mb-3 flex items-center justify-between shadow-md transition-colors hover:border-zinc-700">
    <div className="flex-1 pr-2">
      <div className="flex items-center gap-2">
        {item.isFavorite && <Star size={12} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />}
        <h3 className="font-bold text-zinc-100 leading-tight">{item.name}</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-zinc-500 hover:text-cyan-400 transition-colors bg-zinc-900/50 p-1 rounded-md" title="Edit Item">
            <Edit2 size={14} />
          </button>
        )}
      </div>
      <span className="text-[11px] font-black text-cyan-400 bg-cyan-950/40 border border-cyan-500/50 px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block">
        {item.unit}
      </span>
    </div>
    <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-1 border border-zinc-700 shadow-inner">
      <button onClick={onRemove} disabled={quantity === 0} className={`p-2 rounded-lg transition-colors ${quantity > 0 ? `bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-rose-400 hover:border-rose-500/50` : 'text-zinc-600 cursor-not-allowed'}`}><Minus size={18} /></button>
      <span className="w-6 text-center font-black text-lg text-zinc-100">{quantity}</span>
      <button onClick={onAdd} className="p-2 rounded-lg bg-zinc-800 text-cyan-400 border border-zinc-700 hover:border-cyan-500/50 transition-all"><Plus size={18} /></button>
    </div>
  </div>
);