import React, { useState, useEffect } from 'react';
import { Jar, JarId, TransactionType } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import { X, Plus, Minus, Tag } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  initialType: 'expense' | 'deposit';
  initialJarId?: JarId;
  onSubmit: (data: {
    type: TransactionType;
    jarId: JarId;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  jars,
  initialType,
  initialJarId,
  onSubmit,
}) => {
  const [type, setType] = useState<'expense' | 'deposit'>(initialType);
  const [selectedJarId, setSelectedJarId] = useState<JarId>(initialJarId || 'necessities');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    setType(initialType);
    if (initialJarId) {
      setSelectedJarId(initialJarId);
    }
  }, [initialType, initialJarId, isOpen]);

  if (!isOpen) return null;

  const currentJar = jars.find((j) => j.id === selectedJarId) || jars[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSubmit({
      type: type === 'expense' ? 'expense' : 'manual_deposit',
      jarId: selectedJarId,
      amount: numAmount,
      category: category.trim() || 'Různé',
      note: note.trim(),
      date,
    });

    setAmount('');
    setCategory('');
    setNote('');
    onClose();
  };

  return (
    <div
      id="transaction-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-lg bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header - ALWAYS VISIBLE */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                type === 'expense'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {type === 'expense' ? (
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                {type === 'expense' ? 'Zaznamenat výdaj' : 'Vložit peníze do džbánu'}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/40 font-normal">
                Přiřaďte finanční pohyb konkrétnímu džbánu
              </p>
            </div>
          </div>
          <button
            id="btn-close-transaction-modal"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Toggle Type */}
          <div className="flex rounded-xl bg-[#161618] p-1 border border-white/5">
            <button
              id="tab-type-expense"
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Výdaj z džbánu
            </button>
            <button
              id="tab-type-deposit"
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                type === 'deposit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Vklad do džbánu
            </button>
          </div>

          {/* Select Jar */}
          <div>
            <label
              htmlFor="select-jar"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5"
            >
              Vyberte džbán
            </label>
            <select
              id="select-jar"
              value={selectedJarId}
              onChange={(e) => setSelectedJarId(e.target.value as JarId)}
              className="w-full px-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-[#d4af37]"
            >
              {jars.map((j) => (
                <option key={j.id} value={j.id} className="bg-[#121214] text-white">
                  {j.name} (zůstatek: {j.balance.toLocaleString('cs-CZ')} Kč)
                </option>
              ))}
            </select>
          </div>

          {/* Amount input */}
          <div>
            <label
              htmlFor="input-transaction-amount"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5"
            >
              Částka
            </label>
            <div className="relative">
              <input
                id="input-transaction-amount"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-4 pr-14 py-2.5 text-xl font-bold text-white bg-[#161618] border border-white/10 rounded-xl focus:border-[#d4af37] focus:outline-none transition-all"
                required
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#d4af37]">
                Kč
              </span>
            </div>
          </div>

          {/* Quick Categories from jar examples */}
          {currentJar && currentJar.examples.length > 0 && (
            <div>
              <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                Doporučené kategorie pro {currentJar.shortName}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentJar.examples.slice(0, 5).map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setCategory(ex)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                      category === ex
                        ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40'
                        : 'bg-[#161618] text-white/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category text and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-category"
                className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
              >
                Kategorie / Štítek
              </label>
              <input
                id="input-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="např. Nákup, Lístky, Servis"
                className="w-full px-3 py-2 text-sm bg-[#161618] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label
                htmlFor="input-date"
                className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
              >
                Datum
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#161618] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="input-note"
              className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1"
            >
              Poznámka (volitelná)
            </label>
            <input
              id="input-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="např. Nákup v obchodě, nová kniha..."
              className="w-full px-3 py-2 text-sm bg-[#161618] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          </div>

          {/* Submit - ALWAYS ACCESSIBLE */}
          <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:px-6 bg-[#161618] border-t border-white/5">
            <button
              id="btn-cancel-transaction"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Zrušit
            </button>
            <button
              id="btn-submit-transaction"
              type="submit"
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
              }`}
            >
              {type === 'expense' ? 'Uložit výdaj' : 'Vložit vklad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
