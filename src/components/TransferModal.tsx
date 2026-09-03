import React, { useState, useEffect } from 'react';
import { Jar, JarId } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  fromJarId?: JarId;
  onTransfer: (data: {
    fromJarId: JarId;
    toJarId: JarId;
    amount: number;
    note: string;
    date: string;
  }) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  jars,
  fromJarId: initialFromJarId,
  onTransfer,
}) => {
  const [fromJarId, setFromJarId] = useState<JarId>(initialFromJarId || 'necessities');
  const [toJarId, setToJarId] = useState<JarId>('play');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    if (initialFromJarId) {
      setFromJarId(initialFromJarId);
      // Pick a different default target
      const other = jars.find((j) => j.id !== initialFromJarId);
      if (other) setToJarId(other.id);
    }
  }, [initialFromJarId, isOpen, jars]);

  if (!isOpen) return null;

  const sourceJar = jars.find((j) => j.id === fromJarId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || fromJarId === toJarId) return;

    onTransfer({
      fromJarId,
      toJarId,
      amount: numAmount,
      note: note.trim() || 'Převod mezi džbány',
      date,
    });

    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div
      id="transfer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161618]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-xl shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">Převod mezi džbány</h2>
              <p className="text-xs text-white/40 font-normal">
                Přesunout peníze z jednoho džbánu do druhého
              </p>
            </div>
          </div>
          <button
            id="btn-close-transfer-modal"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Jar */}
          <div>
            <label
              htmlFor="select-from-jar"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
            >
              Z džbánu (Odkud)
            </label>
            <select
              id="select-from-jar"
              value={fromJarId}
              onChange={(e) => setFromJarId(e.target.value as JarId)}
              className="w-full px-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-[#d4af37]"
            >
              {jars.map((j) => (
                <option key={j.id} value={j.id} className="bg-[#121214] text-white">
                  {j.name} (zbývá: {j.balance.toLocaleString('cs-CZ')} Kč)
                </option>
              ))}
            </select>
          </div>

          {/* Destination Jar */}
          <div>
            <label
              htmlFor="select-to-jar"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
            >
              Do džbánu (Kam)
            </label>
            <select
              id="select-to-jar"
              value={toJarId}
              onChange={(e) => setToJarId(e.target.value as JarId)}
              className="w-full px-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-[#d4af37]"
            >
              {jars
                .filter((j) => j.id !== fromJarId)
                .map((j) => (
                  <option key={j.id} value={j.id} className="bg-[#121214] text-white">
                    {j.name} (aktuálně: {j.balance.toLocaleString('cs-CZ')} Kč)
                  </option>
                ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label
                htmlFor="input-transfer-amount"
                className="text-[11px] font-semibold text-white/40 uppercase tracking-widest"
              >
                Částka
              </label>
              {sourceJar && (
                <span className="text-[11px] text-[#d4af37]">
                  Dostupné: {sourceJar.balance.toLocaleString('cs-CZ')} Kč
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="input-transfer-amount"
                type="number"
                min="1"
                step="any"
                max={sourceJar ? sourceJar.balance : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-4 pr-14 py-2.5 text-lg font-bold text-white bg-[#161618] border border-white/10 rounded-xl focus:border-[#d4af37] focus:outline-none transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#d4af37]">
                Kč
              </span>
            </div>
          </div>

          {/* Note and Date */}
          <div>
            <label
              htmlFor="input-transfer-note"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
            >
              Důvod převodu (volitelný)
            </label>
            <input
              id="input-transfer-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="např. Pokrytí nečekaného výdaje..."
              className="w-full px-3 py-2 text-sm bg-[#161618] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              id="btn-cancel-transfer"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Zrušit
            </button>
            <button
              id="btn-confirm-transfer"
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-lg shadow-indigo-950/30 transition-all"
            >
              Provést převod
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
