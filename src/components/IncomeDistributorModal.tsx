import React, { useState } from 'react';
import { Jar, JarId } from '../types';
import { PRESET_ALLOCATIONS } from '../data/defaultJars';
import { formatCZK } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface IncomeDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  initialIncome: number;
  onDistribute: (totalAmount: number, updatedPercentages: Record<JarId, number>) => void;
}

export const IncomeDistributorModal: React.FC<IncomeDistributorModalProps> = ({
  isOpen,
  onClose,
  jars,
  initialIncome,
  onDistribute,
}) => {
  const [income, setIncome] = useState<number>(initialIncome || 45000);
  const [percentages, setPercentages] = useState<Record<JarId, number>>(() => {
    const map: Record<string, number> = {};
    jars.forEach((j) => {
      map[j.id] = j.percentage;
    });
    return map as Record<JarId, number>;
  });

  if (!isOpen) return null;

  const totalPercentage = (Object.values(percentages) as number[]).reduce(
    (sum: number, val: number) => sum + (val || 0),
    0
  );
  const is100 = totalPercentage === 100;

  const handlePercentageChange = (id: JarId, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setPercentages((prev) => ({
      ...prev,
      [id]: clamped,
    }));
  };

  const applyPreset = (presetPercentages: Record<JarId, number>) => {
    setPercentages({ ...presetPercentages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (income <= 0 || !is100) return;

    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore if confetti fails
    }

    onDistribute(income, percentages);
    onClose();
  };

  return (
    <div
      id="income-distributor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161618]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Rozdělit měsíční příjem do 7 džbánů
              </h2>
              <p className="text-xs text-white/40 font-normal">
                Zadejte čistou mzdu nebo příjem a nechte metodu 7 džbánů pracovat
              </p>
            </div>
          </div>
          <button
            id="btn-close-income-modal"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Income Input */}
          <div>
            <label
              htmlFor="input-income-amount"
              className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5"
            >
              Částka k rozdělení (čistý příjem)
            </label>
            <div className="relative">
              <input
                id="input-income-amount"
                type="number"
                min="1"
                step="any"
                value={income || ''}
                onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                placeholder="např. 45000"
                className="w-full pl-4 pr-16 py-3 text-2xl font-bold text-white bg-[#161618] border border-white/10 rounded-xl focus:border-[#d4af37] focus:outline-none transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#d4af37] text-lg">
                Kč
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[30000, 40000, 50000, 65000, 80000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setIncome(quick)}
                  className="px-2.5 py-1 text-xs font-medium text-white/70 bg-[#161618] hover:bg-white/10 border border-white/10 hover:border-[#d4af37]/30 rounded-lg transition-colors"
                >
                  {formatCZK(quick)}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Předvolby rozdělení
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_ALLOCATIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  id={`preset-${preset.id}`}
                  onClick={() => applyPreset(preset.percentages)}
                  className="p-3 text-left border border-white/10 rounded-xl hover:border-[#d4af37]/50 hover:bg-white/5 transition-all text-[#e5e5e7] bg-[#161618] flex flex-col justify-between"
                >
                  <span className="font-semibold text-xs text-white">{preset.name}</span>
                  <span className="text-[11px] text-white/40 line-clamp-1 mt-0.5">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Jars Allocation List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                Rozdělení mezi 7 džbánů
              </label>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  is100
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {is100 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Součet: 100 %
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Součet: {totalPercentage} % (musí být 100 %)
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {jars.map((jar) => {
                const pct = percentages[jar.id] ?? jar.percentage;
                const allocatedKč = Math.round((income * pct) / 100);

                return (
                  <div
                    key={jar.id}
                    className="flex items-center justify-between gap-3 p-2.5 bg-[#161618] rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${jar.theme.iconBg}`}>
                        <JarIcon name={jar.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {jar.name}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">
                          {jar.shortName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">
                          {formatCZK(allocatedKč)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          id={`input-pct-${jar.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={(e) =>
                            handlePercentageChange(jar.id, parseInt(e.target.value, 10))
                          }
                          className="w-14 px-2 py-1 text-right text-xs font-bold bg-[#121214] text-white border border-white/10 rounded-lg focus:outline-none focus:border-[#d4af37]"
                        />
                        <span className="text-xs font-semibold text-white/40">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              id="btn-cancel-distribute"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Zrušit
            </button>
            <button
              id="btn-confirm-distribute"
              type="submit"
              disabled={!is100 || income <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Rozdělit {formatCZK(income)} do džbánů
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
