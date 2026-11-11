import React, { useState, useMemo } from 'react';
import { Jar } from '../types';
import { formatCZK } from '../utils/formatters';
import { TrendingUp, ShieldCheck, HelpCircle, ArrowRight, Zap, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface FinancialIndependenceBarProps {
  jars: Jar[];
  monthlyIncome: number;
  onOpenFinancialIndependence: () => void;
  onOpenCoach?: () => void;
}

export const FinancialIndependenceBar: React.FC<FinancialIndependenceBarProps> = ({
  jars,
  monthlyIncome,
  onOpenFinancialIndependence,
  onOpenCoach,
}) => {
  // Target mode: 'necessities' (50% essential costs) or 'full' (100% current lifestyle)
  const [targetMode, setTargetMode] = useState<'necessities' | 'full'>('necessities');
  const [showExplanation, setShowExplanation] = useState(false);

  // Džbán finanční svobody (Freedom Jar)
  const freedomJar = jars.find((j) => j.id === 'freedom');
  const necessitiesJar = jars.find((j) => j.id === 'necessities');

  const freedomBalance = freedomJar?.balance || 0;
  
  // Monthly living expenses to cover
  const monthlyNecessities = Math.round((monthlyIncome * (necessitiesJar?.percentage || 50)) / 100);
  const targetMonthlyExpense = targetMode === 'necessities' ? monthlyNecessities : monthlyIncome;

  // 4% Rule target capital = Annual expense * 25 = Monthly expense * 300
  const targetCapital = Math.max(1, targetMonthlyExpense * 300);

  // Current passive income generated at 4% p.a. safe withdrawal rate
  const currentMonthlyPassiveIncome = Math.round((freedomBalance * 0.04) / 12);

  // Progress percentage (0 - 100%)
  const progressPct = Math.min(100, Math.max(0, (freedomBalance / targetCapital) * 100));

  // Milestones on the journey
  const milestones = [
    { pct: 25, label: '25 %', desc: 'Základní jistota' },
    { pct: 50, label: '50 %', desc: 'Půlka cesty' },
    { pct: 75, label: '75 %', desc: 'Vysoká svoboda' },
    { pct: 100, label: '100 %', desc: 'Finanční nezávislost' },
  ];

  return (
    <div
      id="financial-independence-indicator"
      className="bg-gradient-to-br from-[#121214] via-[#151518] to-[#121214] rounded-2xl border border-emerald-500/25 hover:border-emerald-500/40 shadow-2xl p-4 sm:p-6 transition-all relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Indikátor finanční nezávislosti
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Pravidlo 4 % (FIRE)
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Míra pokrytí vašich životních nákladů pasivním příjmem z Džbánu svobody.
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0d0d0f] rounded-xl border border-white/10 self-start md:self-auto shrink-0 w-full sm:w-auto">
            <button
              type="button"
              id="btn-fi-mode-necessities"
              onClick={() => setTargetMode('necessities')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                targetMode === 'necessities'
                  ? 'bg-emerald-500 text-[#0a0a0b] shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Nutnosti ({formatCZK(monthlyNecessities)}/měs.)
            </button>
            <button
              type="button"
              id="btn-fi-mode-full"
              onClick={() => setTargetMode('full')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                targetMode === 'full'
                  ? 'bg-emerald-500 text-[#0a0a0b] shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Plný příjem ({formatCZK(monthlyIncome)}/měs.)
            </button>
          </div>
        </div>

        {/* Metric Summary Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Freedom Balance */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#161618] border border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Naspořeno ve Svobodě
            </span>
            <span className="text-base sm:text-xl font-bold text-white tabular-nums">
              {formatCZK(freedomBalance)}
            </span>
            <span className="text-[11px] text-white/40 block mt-0.5">
              investiční kapitál
            </span>
          </div>

          {/* Target Capital Needed */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#161618] border border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Cílový kapitál (4 %)
            </span>
            <span className="text-base sm:text-xl font-bold text-[#d4af37] tabular-nums">
              {formatCZK(targetCapital)}
            </span>
            <span className="text-[11px] text-[#d4af37]/70 block mt-0.5 truncate">
              {targetMode === 'necessities' ? 'pro nutnosti' : 'pro 100 % rozpočtu'}
            </span>
          </div>

          {/* Current Passive Income Generated */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#161618] border border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Pasivní příjem nyní
            </span>
            <span className="text-base sm:text-xl font-bold text-emerald-400 tabular-nums">
              {formatCZK(currentMonthlyPassiveIncome)}
            </span>
            <span className="text-[11px] text-white/40 block mt-0.5 truncate">
              / měsíc (při 4 % p.a.)
            </span>
          </div>

          {/* Independence Percentage */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">
              Dosažená nezávislost
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 tabular-nums tracking-tight">
                {progressPct >= 10 ? progressPct.toFixed(1) : progressPct.toFixed(2)} %
              </span>
            </div>
            <span className="text-[11px] text-emerald-300/70 block mt-0.5">
              {progressPct >= 100
                ? 'Plně dosaženo 🎉'
                : `chybí ${formatCZK(Math.max(0, targetCapital - freedomBalance))}`}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Postup k finanční svobodě:</span>
              <strong className="text-white font-bold tabular-nums">
                {progressPct.toFixed(1)} %
              </strong>
            </span>
            <span className="text-white/40 text-[11px] tabular-nums hidden sm:inline">
              {formatCZK(freedomBalance)} / {formatCZK(targetCapital)}
            </span>
          </div>

          {/* The Progress Bar Container */}
          <div className="relative h-4 sm:h-5 w-full bg-[#0d0d0f] rounded-full p-0.5 border border-white/10 overflow-hidden shadow-inner">
            {/* Filled portion */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#d4af37] via-emerald-400 to-emerald-300 transition-all duration-500 shadow-sm relative overflow-hidden"
              style={{ width: `${Math.max(progressPct > 0 ? 1.5 : 0, Math.min(100, progressPct))}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>

            {/* Subtle Milestone Notch Lines inside Bar */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
              <span className="w-px h-full bg-white/15 ml-[25%]" />
              <span className="w-px h-full bg-white/15 ml-[50%]" />
              <span className="w-px h-full bg-white/15 ml-[75%]" />
            </div>
          </div>

          {/* Milestone Labels below Bar */}
          <div className="grid grid-cols-4 text-center pt-1 text-[10px] sm:text-xs">
            {milestones.map((m) => {
              const isPassed = progressPct >= m.pct;
              return (
                <div
                  key={m.pct}
                  className={`flex flex-col items-center transition-colors ${
                    isPassed ? 'text-emerald-400 font-semibold' : 'text-white/35'
                  }`}
                >
                  <span className="tabular-nums font-bold flex items-center gap-0.5">
                    {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />}
                    {m.label}
                  </span>
                  <span className="text-[9px] sm:text-[10px] hidden xs:inline text-white/40">
                    {m.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-white/50 hover:text-[#d4af37] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Co je pravidlo 4 % a jak funguje?</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCoach && (
              <button
                type="button"
                id="btn-fi-coach-link"
                onClick={onOpenCoach}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Úkoly od kouče</span>
              </button>
            )}

            <button
              type="button"
              id="btn-open-fi-calculator-from-bar"
              onClick={onOpenFinancialIndependence}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0a0a0b] bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-[0.98]"
            >
              <span>Modelovat 10 let k nezávislosti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Explainer Box */}
        {showExplanation && (
          <div className="p-4 rounded-xl bg-[#0e0e10] border border-white/10 text-xs text-white/70 space-y-2 animate-fadeIn">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Jak funguje pravidlo 4 % (Trinity Study & Smart Life)
            </h4>
            <p className="leading-relaxed">
              Pravidlo 4 % je celosvětově uznávaný standard finanční nezávislosti. Říká, že pokud máte své úspory investované v nízkonákladovém diverzifikovaném ETF fondu (např. S&P 500 nebo MSCI World), můžete každoročně vybrat 4 % svého portfolia a kapitál vám s vysokou pravděpodobností nikdy nedojde, protože průměrný dlouhodobý výnos trhů je 7–10 % ročně.
            </p>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
              <p className="font-mono text-emerald-400 text-[11px]">
                Cílový kapitál = Měsíční náklady × 12 měsíců × 25 = Měsíční náklady × 300
              </p>
              <p className="text-white/50 text-[11px]">
                Pro vykrytí vašich {targetMode === 'necessities' ? `nutností (${formatCZK(monthlyNecessities)}/měs.) potřebujete portfolio ${formatCZK(targetCapital)}` : `celkového příjmu (${formatCZK(monthlyIncome)}/měs.) potřebujete portfolio ${formatCZK(targetCapital)}`}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
