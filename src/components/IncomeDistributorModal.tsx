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
  onDistribute: (
    totalAmount: number,
    updatedPercentages: Record<JarId, number>,
    mode: 'fresh_month' | 'add_to_existing'
  ) => void;
}

export const IncomeDistributorModal: React.FC<IncomeDistributorModalProps> = ({
  isOpen,
  onClose,
  jars,
  initialIncome,
  onDistribute,
}) => {
  const [income, setIncome] = useState<number>(initialIncome || 45000);
  const [distributionMode, setDistributionMode] = useState<'fresh_month' | 'add_to_existing'>('fresh_month');
  const [percentages, setPercentages] = useState<Record<JarId, number>>(() => {
    const map: Record<string, number> = {};
    jars.forEach((j) => {
      map[j.id] = j.enabled === false ? 0 : j.percentage;
    });
    return map as Record<JarId, number>;
  });

  if (!isOpen) return null;

  // Only sum active jars
  const activeJars = jars.filter((j) => j.enabled !== false);
  const totalPercentage = activeJars.reduce(
    (sum: number, j) => sum + (percentages[j.id] || 0),
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
    const newPercentages = { ...presetPercentages };
    // Zero out disabled jars
    jars.forEach((j) => {
      if (j.enabled === false) {
        newPercentages[j.id] = 0;
      }
    });

    // If some jars are disabled, proportionally normalize the active ones to 100%
    const currentActiveSum = activeJars.reduce(
      (sum, j) => sum + (newPercentages[j.id] || 0),
      0
    );
    if (currentActiveSum > 0 && currentActiveSum !== 100) {
      let remaining = 100;
      activeJars.forEach((j) => {
        const scaled = Math.round(((newPercentages[j.id] || 0) / currentActiveSum) * 100);
        remaining -= scaled;
        newPercentages[j.id] = scaled;
      });
      if (remaining !== 0 && activeJars.length > 0) {
        newPercentages[activeJars[0].id] += remaining;
      }
    }

    setPercentages(newPercentages);
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

    onDistribute(income, percentages, distributionMode);
    onClose();
  };

  return (
    <div
      id="income-distributor-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header - ALWAYS VISIBLE */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                Rozdělit měsíční příjem do 7 džbánů
              </h2>
              <p className="text-[11px] sm:text-xs text-white/40 font-normal">
                Zadejte čistou mzdu nebo příjem a nechte metodu 7 džbánů pracovat
              </p>
            </div>
          </div>
          <button
            id="btn-close-income-modal"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
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

          {/* Distribution Mode Selection: Fresh Month vs Add */}
          <div className="p-3.5 rounded-xl bg-[#161618] border border-white/10 space-y-2">
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider">
              Způsob rozdělení do džbánů
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-mode-fresh-month"
                onClick={() => setDistributionMode('fresh_month')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  distributionMode === 'fresh_month'
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-xs'
                    : 'bg-[#121214] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      distributionMode === 'fresh_month'
                        ? 'border-[#d4af37] bg-[#d4af37]'
                        : 'border-white/30 bg-transparent'
                    }`}
                  >
                    {distributionMode === 'fresh_month' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    Nový měsíc (začít od 0 Kč)
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mt-1 pl-6 leading-relaxed">
                  Vynuluje předchozí zůstatky. Džbány budou obsahovat přesně {formatCZK(income)}.
                </p>
              </button>

              <button
                type="button"
                id="btn-mode-add-existing"
                onClick={() => setDistributionMode('add_to_existing')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  distributionMode === 'add_to_existing'
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-xs'
                    : 'bg-[#121214] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      distributionMode === 'add_to_existing'
                        ? 'border-[#d4af37] bg-[#d4af37]'
                        : 'border-white/30 bg-transparent'
                    }`}
                  >
                    {distributionMode === 'add_to_existing' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    Přičíst ke stávajícím zůstatkům
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mt-1 pl-6 leading-relaxed">
                  Ponechá naspořené částky v džbánech a nový příděl k nim přičte navíc.
                </p>
              </button>
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
                const isEnabled = jar.enabled !== false;
                const pct = isEnabled ? (percentages[jar.id] ?? jar.percentage) : 0;
                const allocatedKč = isEnabled ? Math.round((income * pct) / 100) : 0;
                const finalBalance =
                  distributionMode === 'fresh_month'
                    ? (isEnabled ? allocatedKč : (jar.balance || 0))
                    : (jar.balance || 0) + allocatedKč;

                return (
                  <div
                    key={jar.id}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-[#161618] border-white/5'
                        : 'bg-[#121214] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isEnabled ? jar.theme.iconBg : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        <JarIcon name={jar.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {jar.name}
                          </p>
                          {!isEnabled && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/50 border border-white/10">
                              Vypnuto v nastavení
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/40 truncate">
                          {!isEnabled ? (
                            <span>Zůstatek: {formatCZK(jar.balance || 0)} (džbán je deaktivován)</span>
                          ) : distributionMode === 'fresh_month' ? (
                            <span>Výsledný stav: <strong className="text-emerald-400 font-semibold">{formatCZK(finalBalance)}</strong></span>
                          ) : (
                            <span>Původní {formatCZK(jar.balance)} + {formatCZK(allocatedKč)} = <strong className="text-emerald-400 font-semibold">{formatCZK(finalBalance)}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={`text-xs font-bold ${isEnabled ? 'text-white' : 'text-white/40'}`}>
                          +{formatCZK(allocatedKč)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          id={`input-pct-${jar.id}`}
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEnabled}
                          value={pct}
                          onChange={(e) =>
                            handlePercentageChange(jar.id, parseInt(e.target.value, 10))
                          }
                          className={`w-14 px-2 py-1 text-right text-xs font-bold border rounded-lg focus:outline-none focus:border-[#d4af37] ${
                            isEnabled
                              ? 'bg-[#121214] text-white border-white/10'
                              : 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
                          }`}
                        />
                        <span className="text-xs font-semibold text-white/40">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>

          {/* Action buttons - ALWAYS ACCESSIBLE */}
          <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:px-6 bg-[#161618] border-t border-white/5">
            <button
              id="btn-cancel-distribute"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Zrušit
            </button>
            <button
              id="btn-confirm-distribute"
              type="submit"
              disabled={!is100 || income <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Rozdělit {formatCZK(income)} do džbánů</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
