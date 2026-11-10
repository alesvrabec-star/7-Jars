import React, { useState, useEffect } from 'react';
import { Jar, JarId } from '../types';
import { formatCZK } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import { X, Sliders, Check, AlertCircle, ArrowRightLeft, Sparkles, Power, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  onSaveJars: (updatedJars: Jar[]) => void;
  onOpenTransfer?: (fromJarId?: JarId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  jars,
  onSaveJars,
  onOpenTransfer,
}) => {
  const [localJars, setLocalJars] = useState<Jar[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalJars(
        jars.map((j) => ({
          ...j,
          enabled: j.enabled !== false, // default true
        }))
      );
      setSavedSuccess(false);
    }
  }, [isOpen, jars]);

  if (!isOpen) return null;

  const activeCount = localJars.filter((j) => j.enabled !== false).length;

  const handleToggle = (jarId: JarId) => {
    const target = localJars.find((j) => j.id === jarId);
    if (!target) return;

    // Safety check: Prevent disabling all jars
    if (target.enabled !== false && activeCount <= 1) {
      alert('Musí zůstat aktivní alespoň 1 džbán.');
      return;
    }

    setLocalJars((prev) =>
      prev.map((j) => (j.id === jarId ? { ...j, enabled: !(j.enabled !== false) } : j))
    );
  };

  // Re-normalize active percentages to 100%
  const handleAutoRebalance = () => {
    const activeJars = localJars.filter((j) => j.enabled !== false);
    if (activeJars.length === 0) return;

    const currentActiveSum = activeJars.reduce((sum, j) => sum + (j.percentage || 0), 0);
    let remainingPct = 100;

    const updated = localJars.map((j, idx) => {
      if (j.enabled === false) {
        return { ...j, percentage: 0 };
      }

      if (currentActiveSum > 0) {
        // Proportionally scale up
        const scaled = Math.round(((j.percentage || 0) / currentActiveSum) * 100);
        remainingPct -= scaled;
        return { ...j, percentage: scaled };
      } else {
        // Equal split
        const equalShare = Math.floor(100 / activeJars.length);
        return { ...j, percentage: equalShare };
      }
    });

    // Adjust rounding difference on the first active jar
    if (remainingPct !== 0) {
      const firstActive = updated.find((j) => j.enabled !== false);
      if (firstActive) {
        firstActive.percentage += remainingPct;
      }
    }

    setLocalJars(updated);
  };

  const handleSave = () => {
    onSaveJars(localJars);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Nastavení aktivních džbánů
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#d4af37] border border-[#d4af37]/30 font-semibold">
                  {activeCount} z 7 aktivních
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Vyberte, které džbány chcete používat. Vypnuté džbány se skryjí z přehledu a nebudou se plnit příjmem.
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Info Banner */}
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3 text-xs text-white/70 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <span>
                Pokud některý džbán nepotřebujete (např. Dary nebo Hry), můžete ho jednoduše vypnout.
                Případný naspořený zůstatek se <strong>nesmaže</strong> a můžete ho kdykoliv převést do jiného džbánu.
              </span>
            </div>
          </div>

          {/* List of 7 Jars with Toggles */}
          <div className="space-y-2.5">
            {localJars.map((jar) => {
              const isEnabled = jar.enabled !== false;
              const hasBalance = (jar.balance || 0) > 0;

              return (
                <div
                  key={jar.id}
                  id={`settings-jar-${jar.id}`}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isEnabled
                      ? 'bg-[#161618] border-white/10 hover:border-white/20'
                      : 'bg-[#121214] border-white/5 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3.5">
                    {/* Icon & Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 transition-opacity ${
                          isEnabled ? jar.theme.iconBg : 'bg-white/5 text-white/40 border-white/10'
                        }`}
                      >
                        <JarIcon name={jar.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {jar.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isEnabled
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-white/5 text-white/40 border-white/10'
                            }`}
                          >
                            {isEnabled ? 'Aktivní' : 'Vypnuto'}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate mt-0.5">
                          {jar.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Balance & Toggle Switch */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] uppercase font-semibold text-white/40 block">
                          Zůstatek
                        </span>
                        <span className={`text-xs font-bold ${hasBalance ? 'text-white' : 'text-white/40'}`}>
                          {formatCZK(jar.balance || 0)}
                        </span>
                      </div>

                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        id={`toggle-jar-${jar.id}`}
                        onClick={() => handleToggle(jar.id)}
                        role="switch"
                        aria-checked={isEnabled}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-[#121214] ${
                          isEnabled ? 'bg-emerald-500' : 'bg-white/15'
                        }`}
                      >
                        <span className="sr-only">Přepnout {jar.name}</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Warning if disabled but holds money */}
                  {!isEnabled && hasBalance && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-amber-500/10 -mx-3.5 -mb-3.5 p-3 rounded-b-xl border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Ve džbánu zbývá <strong>{formatCZK(jar.balance)}</strong>.</span>
                      </div>
                      {onOpenTransfer && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTransfer(jar.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors cursor-pointer w-fit"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Převést zůstatek jinam</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Auto Re-balance percentages button */}
          <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white">
                Chcete přepočítat procenta zbývajících džbánů?
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                Automaticky upraví procenta aktivních džbánů, aby v součtu dávala 100 %.
              </p>
            </div>
            <button
              type="button"
              id="btn-auto-rebalance-pct"
              onClick={handleAutoRebalance}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Přepočítat na 100 %</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-white/5 bg-[#161618]">
          <span className="text-xs text-white/40">
            {activeCount === 7 ? 'Používáte všech 7 džbánů' : `Aktivních: ${activeCount} z 7 džbánů`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-cancel-settings"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              Zrušit
            </button>

            <button
              type="button"
              id="btn-save-settings"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Uloženo!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Uložit nastavení</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
