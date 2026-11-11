import React, { useState, useEffect, useMemo } from 'react';
import { Jar, JarId } from '../types';
import { formatCZK } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import {
  X,
  Wallet,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Coins,
  ArrowRight,
  TrendingUp,
  History,
} from 'lucide-react';

interface InitialBalancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  onSaveBalances: (
    updatedBalances: Record<JarId, number>,
    logTransaction: boolean,
    transactionNote?: string
  ) => void;
}

export const InitialBalancesModal: React.FC<InitialBalancesModalProps> = ({
  isOpen,
  onClose,
  jars,
  onSaveBalances,
}) => {
  // Local state map of jarId -> string input value
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
  const [logInHistory, setLogInHistory] = useState(true);
  const [transactionNote, setTransactionNote] = useState(
    'Počáteční nastavení stavu džbánů (přechod z jiné aplikace)'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, string> = {};
      jars.forEach((jar) => {
        initialMap[jar.id] = String(jar.balance || 0);
      });
      setBalanceInputs(initialMap);
      setSavedSuccess(false);
    }
  }, [isOpen, jars]);

  if (!isOpen) return null;

  const handleInputChange = (jarId: JarId, val: string) => {
    // Only permit digits
    const cleaned = val.replace(/[^0-9]/g, '');
    setBalanceInputs((prev) => ({
      ...prev,
      [jarId]: cleaned,
    }));
  };

  const handleSetQuick = (jarId: JarId, amount: number) => {
    setBalanceInputs((prev) => ({
      ...prev,
      [jarId]: String(Math.max(0, amount)),
    }));
  };

  const handleResetAllToZero = () => {
    if (window.confirm('Chcete nastavit počáteční zůstatek všech džbánů na 0 Kč?')) {
      const zeroMap: Record<string, string> = {};
      jars.forEach((jar) => {
        zeroMap[jar.id] = '0';
      });
      setBalanceInputs(zeroMap);
    }
  };

  // Calculations
  const currentTotal = jars.reduce((sum, j) => sum + (j.balance || 0), 0);
  const newTotal = Object.entries(balanceInputs).reduce(
    (sum, [, val]) => sum + (Number(val) || 0),
    0
  );
  const difference = newTotal - currentTotal;

  const handleSave = () => {
    const updatedMap: Record<JarId, number> = {} as any;
    jars.forEach((j) => {
      const raw = balanceInputs[j.id];
      updatedMap[j.id] = raw === '' ? 0 : Math.max(0, Number(raw) || 0);
    });

    onSaveBalances(updatedMap, logInHistory, transactionNote);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div
      id="initial-balances-modal"
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
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Počáteční / aktuální stav džbánů
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  Přechod z jiné aplikace
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Nastavte si přesné aktuální zůstatky v jednotlivých džbánech, abyste mohli hned začít.
              </p>
            </div>
          </div>
          <button
            id="btn-close-initial-balances"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Top Banner Explainer */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#161618] to-[#121214] border border-[#d4af37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Jak funguje nastavení počátečních zůstatků?
              </span>
              <p className="text-white/60 leading-relaxed">
                Zde zadejte své dosavadní úspory a zůstatky na účtech či v hotovosti. Aplikace nastaví džbány přesně podle vašich čísel a od této chvíle můžete evidovat příjmy a výdaje.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetAllToZero}
              className="px-3 py-1.5 text-xs text-white/60 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              Vynulovat vše na 0 Kč
            </button>
          </div>

          {/* List of 7 Jars with Input Fields */}
          <div className="space-y-3">
            {jars.map((jar) => {
              const currentVal = balanceInputs[jar.id] ?? String(jar.balance || 0);
              const numVal = Number(currentVal) || 0;
              const isEnabled = jar.enabled !== false;

              return (
                <div
                  key={jar.id}
                  id={`initial-jar-row-${jar.id}`}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isEnabled
                      ? 'bg-[#161618] border-white/10 hover:border-white/20'
                      : 'bg-[#121214] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Jar Icon & Meta */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${jar.theme.iconBg}`}>
                        <JarIcon name={jar.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {jar.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${jar.theme.badgeBg} ${jar.theme.badgeText}`}
                          >
                            {jar.percentage} %
                          </span>
                          {!isEnabled && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-white/40">
                              vypnuto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 truncate mt-0.5">
                          {jar.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Balance Input Box */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <input
                          id={`input-initial-balance-${jar.id}`}
                          type="text"
                          inputMode="numeric"
                          value={currentVal}
                          onChange={(e) => handleInputChange(jar.id, e.target.value)}
                          placeholder="0"
                          className="w-full pl-3 pr-10 py-2 bg-[#0d0d0f] border border-white/10 rounded-xl text-white font-bold text-right text-sm focus:outline-none focus:border-[#d4af37]/70 transition-colors tabular-nums"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40 pointer-events-none">
                          Kč
                        </span>
                      </div>

                      {/* Quick Zero / Reset Button */}
                      {numVal > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetQuick(jar.id, 0)}
                          title="Vynulovat tento džbán"
                          className="p-2 text-white/40 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl border border-white/10 transition-colors shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction History Logging Checkbox */}
          <div className="p-3.5 rounded-xl bg-[#161618] border border-white/10 space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={logInHistory}
                onChange={(e) => setLogInHistory(e.target.checked)}
                className="mt-0.5 rounded border-white/20 text-[#d4af37] focus:ring-[#d4af37] cursor-pointer"
              />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-white block">
                  Zaznamenat úpravu zůstatků do historie transakcí
                </span>
                <span className="text-white/50">
                  Vytvoří v přehledu pohybů záznam s přesným rozdílem, abyste věděli, kdy a jak jste počáteční stav nastavili.
                </span>
              </div>
            </label>

            {logInHistory && (
              <div className="pt-1">
                <input
                  type="text"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  placeholder="Poznámka k záznamu v historii..."
                  className="w-full px-3 py-1.5 text-xs bg-[#0d0d0f] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#d4af37]/60 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-white/5 bg-[#161618]">
          {/* Total comparison */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 block">
                Nový součet ve džbánech
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                  {formatCZK(newTotal)}
                </span>
                {difference !== 0 && (
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      difference > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({difference > 0 ? `+${formatCZK(difference)}` : formatCZK(difference)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              id="btn-cancel-initial-balances"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              Zrušit
            </button>

            <button
              type="button"
              id="btn-save-initial-balances"
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
                  <span>Nastavit zůstatky</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
