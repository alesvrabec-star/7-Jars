import React from 'react';
import { Jar } from '../types';
import { formatCZK } from '../utils/formatters';
import { Wallet, Sparkles, BookOpen, PlusCircle, Repeat, RotateCcw, Coins } from 'lucide-react';

interface StatsBarProps {
  jars: Jar[];
  monthlyIncome: number;
  onOpenDistribute: () => void;
  onOpenExpense: () => void;
  onOpenGuide: () => void;
  onOpenRecurring: () => void;
  onResetJarsToZero?: () => void;
  onOpenInitialBalances?: () => void;
  recurringCount?: number;
  currentMonthName?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  jars,
  monthlyIncome,
  onOpenDistribute,
  onOpenExpense,
  onOpenGuide,
  onOpenRecurring,
  onResetJarsToZero,
  onOpenInitialBalances,
  recurringCount = 0,
  currentMonthName,
}) => {
  const totalBalance = jars.reduce((acc, j) => acc + (j.balance || 0), 0);

  return (
    <div id="stats-bar" className="bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-4 sm:p-6 mb-5 sm:mb-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
          {/* Total in Jars */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#161618] border border-white/5 hover:border-white/10 flex items-center gap-3 sm:gap-3.5 transition-colors">
            <div className="p-2.5 sm:p-3 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shrink-0 shadow-xs">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                Celkem ve džbánech
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white tracking-tight truncate tabular-nums">
                {formatCZK(totalBalance)}
              </p>
            </div>
          </div>

          {/* Planned monthly income */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#161618] border border-white/5 hover:border-white/10 flex items-center gap-3 sm:gap-3.5 transition-colors">
            <div className="p-2.5 sm:p-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] sm:text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                  Měsíční příjem
                </p>
                {currentMonthName && (
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                    {currentMonthName}
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-emerald-400 tracking-tight truncate tabular-nums">
                {formatCZK(monthlyIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-main-distribute"
            onClick={onOpenDistribute}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Rozdělit příjem
          </button>

          <button
            id="btn-main-recurring"
            onClick={onOpenRecurring}
            title="Spravovat a měsíčně zaúčtovat trvalé příkazy"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all cursor-pointer"
          >
            <Repeat className="w-4 h-4 text-[#d4af37]" />
            <span>Trvalé příkazy</span>
            {recurringCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#d4af37]/25 text-[#d4af37] text-[10px] font-bold rounded-full">
                {recurringCount}
              </span>
            )}
          </button>

          <button
            id="btn-main-expense"
            onClick={onOpenExpense}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Zadat výdaj
          </button>

          {onResetJarsToZero && (
            <button
              id="btn-main-reset-month"
              onClick={onResetJarsToZero}
              title="Vynulovat všechny džbány na 0 Kč pro začátek nového měsíce"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/60" />
              <span>Vynulovat na 0 Kč</span>
            </button>
          )}

          {onOpenInitialBalances && (
            <button
              id="btn-stats-initial-balances"
              onClick={onOpenInitialBalances}
              title="Nastavit počáteční nebo aktuální stav džbánů (přechod z jiné aplikace)"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Počáteční stav</span>
            </button>
          )}

          <button
            id="btn-main-guide"
            onClick={onOpenGuide}
            title="Jak funguje metoda Sedmi džbánů"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-white/70 hover:text-[#d4af37] bg-[#161618] hover:bg-[#1f1f23] border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            Metodika
          </button>
        </div>
      </div>
    </div>
  );
};
