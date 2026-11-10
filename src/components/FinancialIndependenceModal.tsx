import React, { useState, useMemo } from 'react';
import { Jar } from '../types';
import { formatCZK } from '../utils/formatters';
import {
  X,
  TrendingUp,
  Compass,
  Sparkles,
  ShieldCheck,
  Calculator,
  Target,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Zap,
  Clock,
  ArrowUpRight,
  Percent,
  HelpCircle,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface FinancialIndependenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  monthlyIncome: number;
  onOpenCoach?: () => void;
}

const ETF_RETURN_PRESETS = [
  {
    label: 'Konzervativní',
    rate: 5.0,
    desc: 'Smíšené portfolio (akcie + dluhopisy)',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    label: 'Globální ETF',
    rate: 7.0,
    desc: 'MSCI World / FTSE All-World (reálný výnos)',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    label: 'S&P 500 (USA)',
    rate: 8.5,
    desc: 'Dlouhodobý historický průměr 8–10 %',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    label: 'Růstové ETF',
    rate: 11.0,
    desc: 'Technologie & inovace (např. Nasdaq 100)',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export const FinancialIndependenceModal: React.FC<FinancialIndependenceModalProps> = ({
  isOpen,
  onClose,
  jars,
  monthlyIncome,
  onOpenCoach,
}) => {
  const [viewMode, setViewMode] = useState<'guide' | 'simulator'>('guide');

  // Find Freedom Jar (Džbán finanční svobody)
  const freedomJar = jars.find((j) => j.id === 'freedom');
  const necessitiesJar = jars.find((j) => j.id === 'necessities');

  // Baseline auto values
  const defaultInitialCapital = freedomJar ? freedomJar.balance : 50000;
  const defaultMonthlyInvestment = freedomJar
    ? Math.round((monthlyIncome * (freedomJar.percentage || 10)) / 100)
    : 4500;
  const defaultTargetMonthlyPassive = necessitiesJar
    ? Math.round((monthlyIncome * (necessitiesJar.percentage || 50)) / 100)
    : 25000;

  // Custom vs Auto mode
  const [useAutoSync, setUseAutoSync] = useState(true);

  // Simulation inputs
  const [initialCapital, setInitialCapital] = useState<number>(defaultInitialCapital);
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(defaultMonthlyInvestment);
  const [targetMonthlyPassive, setTargetMonthlyPassive] = useState<number>(defaultTargetMonthlyPassive);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8.5); // 8.5% p.a. default
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4); // 4% rule (Smart Life / Trinity)
  const [simulationYears, setSimulationYears] = useState<number>(10);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Sync with real data when auto mode is toggled on
  const handleToggleAutoSync = () => {
    if (!useAutoSync) {
      setInitialCapital(freedomJar ? freedomJar.balance : 50000);
      setMonthlyInvestment(
        freedomJar
          ? Math.round((monthlyIncome * (freedomJar.percentage || 10)) / 100)
          : 4500
      );
      setTargetMonthlyPassive(
        necessitiesJar
          ? Math.round((monthlyIncome * (necessitiesJar.percentage || 50)) / 100)
          : 25000
      );
    }
    setUseAutoSync(!useAutoSync);
  };

  // Financial Independence calculations
  // FI Number = Annual Expenses / 0.04 (or Monthly Expenses * 12 / 0.04 = Monthly Expenses * 300)
  const financialIndependenceTarget = useMemo(() => {
    const annualExpenses = targetMonthlyPassive * 12;
    return Math.round(annualExpenses / (safeWithdrawalRate / 100));
  }, [targetMonthlyPassive, safeWithdrawalRate]);

  // Savings rate towards Freedom Jar
  const savingsRate = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return Math.round((monthlyInvestment / monthlyIncome) * 100);
  }, [monthlyInvestment, monthlyIncome]);

  // Exact time calculation in months and years
  const calculateExactTimeToTarget = (
    ratePercent: number,
    monthlyInv: number,
    startCap: number,
    target: number
  ): { years: number; months: number; totalMonths: number } | null => {
    if (startCap >= target) return { years: 0, months: 0, totalMonths: 0 };
    if (monthlyInv <= 0 && ratePercent <= 0) return null;
    const r = ratePercent / 100 / 12;
    let bal = startCap;
    for (let m = 1; m <= 600; m++) {
      bal = bal * (1 + r) + monthlyInv;
      if (bal >= target) {
        return {
          years: Math.floor(m / 12),
          months: m % 12,
          totalMonths: m,
        };
      }
    }
    return null;
  };

  const calculateBalanceAt10Years = (
    ratePercent: number,
    monthlyInv: number,
    startCap: number
  ): number => {
    const r = ratePercent / 100 / 12;
    let bal = startCap;
    for (let m = 1; m <= 120; m++) {
      bal = bal * (1 + r) + monthlyInv;
    }
    return Math.round(bal);
  };

  // Exact time for current selected return rate
  const currentTimeToTarget = useMemo(() => {
    return calculateExactTimeToTarget(annualReturnRate, monthlyInvestment, initialCapital, financialIndependenceTarget);
  }, [annualReturnRate, monthlyInvestment, initialCapital, financialIndependenceTarget]);

  // Exact time for conservative 5% baseline
  const conservativeTimeToTarget = useMemo(() => {
    return calculateExactTimeToTarget(5.0, monthlyInvestment, initialCapital, financialIndependenceTarget);
  }, [monthlyInvestment, initialCapital, financialIndependenceTarget]);

  // Time saved comparison (in years and months)
  const timeSavedComparison = useMemo(() => {
    if (!currentTimeToTarget || !conservativeTimeToTarget) return null;
    const savedMonths = conservativeTimeToTarget.totalMonths - currentTimeToTarget.totalMonths;
    if (savedMonths <= 0) return null;
    return {
      years: Math.floor(savedMonths / 12),
      months: savedMonths % 12,
      totalMonths: savedMonths,
    };
  }, [currentTimeToTarget, conservativeTimeToTarget]);

  // Extra gains purely from higher compounding in 10 years
  const extraGainsAt10Years = useMemo(() => {
    const current10 = calculateBalanceAt10Years(annualReturnRate, monthlyInvestment, initialCapital);
    const conservative10 = calculateBalanceAt10Years(5.0, monthlyInvestment, initialCapital);
    return Math.max(0, current10 - conservative10);
  }, [annualReturnRate, monthlyInvestment, initialCapital]);

  // Yearly projection calculation for compounding ETF returns
  const yearlyData = useMemo(() => {
    const monthlyRate = annualReturnRate / 100 / 12;
    const data: Array<{
      year: number;
      totalDeposited: number;
      compoundInterest: number;
      totalBalance: number;
      monthlyPassiveIncome: number;
      pctOfTarget: number;
    }> = [];

    let currentBalance = initialCapital;
    let currentDeposited = initialCapital;

    // Year 0
    data.push({
      year: 0,
      totalDeposited: Math.round(currentDeposited),
      compoundInterest: 0,
      totalBalance: Math.round(currentBalance),
      monthlyPassiveIncome: Math.round((currentBalance * (safeWithdrawalRate / 100)) / 12),
      pctOfTarget: Math.min(100, Math.round((currentBalance / (financialIndependenceTarget || 1)) * 100)),
    });

    for (let year = 1; year <= simulationYears; year++) {
      for (let month = 1; month <= 12; month++) {
        currentBalance = currentBalance * (1 + monthlyRate) + monthlyInvestment;
        currentDeposited += monthlyInvestment;
      }

      const interest = Math.max(0, currentBalance - currentDeposited);
      const monthlyPassive = (currentBalance * (safeWithdrawalRate / 100)) / 12;
      const pctOfTarget = Math.min(100, Math.round((currentBalance / (financialIndependenceTarget || 1)) * 100));

      data.push({
        year,
        totalDeposited: Math.round(currentDeposited),
        compoundInterest: Math.round(interest),
        totalBalance: Math.round(currentBalance),
        monthlyPassiveIncome: Math.round(monthlyPassive),
        pctOfTarget,
      });
    }

    return data;
  }, [initialCapital, monthlyInvestment, annualReturnRate, safeWithdrawalRate, simulationYears, financialIndependenceTarget]);

  // Milestone points
  const finalYearData = yearlyData[yearlyData.length - 1];
  const targetYearReached = yearlyData.find((d) => d.totalBalance >= financialIndependenceTarget);

  const milestoneLean = yearlyData.find((d) => d.totalBalance >= financialIndependenceTarget * 0.33);
  const milestoneBarista = yearlyData.find((d) => d.totalBalance >= financialIndependenceTarget * 0.66);
  const milestoneFull = targetYearReached;

  if (!isOpen) return null;

  // Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 45;
  const paddingY = 25;
  const maxVal = Math.max(...yearlyData.map((d) => d.totalBalance), financialIndependenceTarget * 1.05);

  const getY = (val: number) => {
    const usableHeight = chartHeight - paddingY * 2;
    return chartHeight - paddingY - (val / (maxVal || 1)) * usableHeight;
  };

  const getX = (year: number) => {
    const usableWidth = chartWidth - paddingX * 2;
    return paddingX + (year / simulationYears) * usableWidth;
  };

  // SVG Area path generator for total balance
  const balancePoints = yearlyData.map((d) => `${getX(d.year)},${getY(d.totalBalance)}`).join(' ');
  const balanceArea = `${balancePoints} ${getX(simulationYears)},${chartHeight - paddingY} ${getX(0)},${chartHeight - paddingY}`;

  // SVG Area path generator for deposited portion
  const depositPoints = yearlyData.map((d) => `${getX(d.year)},${getY(d.totalDeposited)}`).join(' ');
  const depositArea = `${depositPoints} ${getX(simulationYears)},${chartHeight - paddingY} ${getX(0)},${chartHeight - paddingY}`;

  // Target line Y
  const targetLineY = getY(financialIndependenceTarget);

  return (
    <div
      id="financial-independence-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  10 let k finanční nezávislosti
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Smart Life & 7 džbánů
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Vysvětlivky, pravidlo 4 % a interaktivní modelování složeného úročení.
              </p>
            </div>
          </div>
          <button
            id="btn-close-fi-modal"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher: Návod & Vysvětlivky vs. Simulátor */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#141416]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="tab-fi-guide"
              onClick={() => setViewMode('guide')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'guide'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Návod a srozumitelné vysvětlivky</span>
            </button>

            <button
              type="button"
              id="tab-fi-simulator"
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'simulator'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kalkulačka & graf</span>
            </button>
          </div>

          {onOpenCoach && (
            <button
              type="button"
              id="btn-fi-open-coach"
              onClick={() => {
                onClose();
                onOpenCoach();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Otevřít finančního kouče</span>
              <span className="sm:hidden">Kouč</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW MODE 1: NÁVOD A SROZUMITELNÉ VYSVĚTLIVKY (PRO KAŽDÉHO) */}
          {viewMode === 'guide' && (
            <div className="space-y-4">
              {/* Introduction Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#161618] to-[#121214] border border-[#d4af37]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                  Jednoduchý průvodce v lidské řeči
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Co znamená „10 let k finanční nezávislosti“ a jak to funguje?
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Finanční nezávislost neznamená mít na účtu miliardy a létat tryskáčem. Znamená to stav, kdy <strong>výnosy z vašich investic plně zaplatí vaše měsíční výdaje</strong>. Nemusíte už chodit do práce z nutnosti, abyste zaplatili účty – pracujete jen tehdy, pokud sami chcete.
                </p>
              </div>

              {/* Explanatory Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Co je Číslo finanční svobody */}
                <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-xs">1</span>
                    Co je to „Číslo finanční svobody“?
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Je to cílová částka, kterou potřebujete mít zainvestovanou. Počítá se podle <strong>pravidla 4 %</strong> (25× roční výdaje).<br />
                    <strong className="text-white">Příklad:</strong> Pokud na život potřebujete 25 000 Kč měsíčně (= 300 000 Kč ročně), vaše Číslo svobody je <strong>7,5 milionu Kč</strong>.
                  </p>
                </div>

                {/* 2. Co je pravidlo 4 % */}
                <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                    Jak funguje „Pravidlo 4 %“?
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Akciové indexy (jako S&P 500) dlouhodobě vydělávají průměrně <strong>7 až 9 % ročně</strong>. Když si každý rok vyberete <strong>4 %</strong> na životní náklady, zbylá 3 až 5 % pokryjí inflaci a kapitál vám <strong>nikdy nedojde</strong>.
                  </p>
                </div>

                {/* 3. Proč se Džbán svobody nikdy neutrácí */}
                <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
                    Proč se Džbán svobody NIKDY neutrácí?
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Džbán svobody je vaše <em>„zlatá slepice“</em>. Koupit si z něj auto nebo jet na dovolenou je jako slepici zabít a sníst – už nikdy nesnese zlatá vejce. Peníze z tohoto džbánu nakupují aktiva, ze kterých pak žijete.
                  </p>
                </div>

                {/* 4. Složené úročení */}
                <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">4</span>
                    Jak funguje složené úročení (úrok z úroků)?
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    První 3 roky růst vypadá nenápadně, protože tvoří většinu vaše vlastní vklady. Kolem 5. až 10. roku se ale probudí exponenciála – úroky začnou vydělávat více než to, co posíláte z výplaty!
                  </p>
                </div>
              </div>

              {/* 3 Simple Action Steps */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3 kroky, co přesně máte dělat v praxi:
                </h4>
                <div className="space-y-2.5 text-xs text-white/70">
                  <div className="flex items-start gap-3 p-3 bg-[#121214] rounded-xl border border-white/5">
                    <span className="font-bold text-[#d4af37] shrink-0">Krok A:</span>
                    <span>Naplňte Džbán nouzové rezervy na 3 měsíce nutných výdajů na spořicím účtu (jistota pro případ ztráty příjmu).</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#121214] rounded-xl border border-white/5">
                    <span className="font-bold text-emerald-400 shrink-0">Krok B:</span>
                    <span>Každý měsíc po výplatě pošlete peníze ze Džbánu svobody do nízkonákladového ETF fondu (např. S&P 500 nebo MSCI World).</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#121214] rounded-xl border border-white/5">
                    <span className="font-bold text-purple-400 shrink-0">Krok C:</span>
                    <span>Neřešte zprávy v televizi o klesajících trzích. Když trhy klesají, nakupujete ETF se slevou; když rostou, vaše portfolio bohatne.</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-white/50">
                    Chcete vidět, jak vaše konkrétní čísla vychází na grafu?
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode('simulator')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0a0a0b] font-bold text-xs hover:brightness-110 shadow-md transition-all cursor-pointer"
                  >
                    <span>Otevřít kalkulačku a interaktivní graf</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: INTERAKTIVNÍ KALKULAČKA A GRAF (DETAILNÍ MODEL) */}
          {viewMode === 'simulator' && (
            <>
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* KPI 1: Cílové číslo nezávislosti */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block mb-1">
                    Číslo finanční svobody
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-[#d4af37] tabular-nums">
                    {formatCZK(financialIndependenceTarget)}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">
                    25× roční výdaje ({formatCZK(targetMonthlyPassive)}/měs)
                  </p>
                </div>

                {/* KPI 2: Pasivní příjem za 10 let */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block mb-1">
                    Pasivní příjem za {simulationYears} let
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                    {formatCZK(finalYearData.monthlyPassiveIncome)} / měs
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">
                    Při 4% bezpečném výběru
                  </p>
                </div>

                {/* KPI 3: Celkový majetek za 10 let */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block mb-1">
                    Naspořeno a zhodnoceno
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {formatCZK(finalYearData.totalBalance)}
                  </p>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    Z toho zisk: +{formatCZK(finalYearData.compoundInterest)}
                  </p>
                </div>

                {/* KPI 4: Doba do cíle při tomto zhodnocení */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block mb-1">
                    Čas do dosažení cíle
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {currentTimeToTarget
                      ? `${currentTimeToTarget.years} r. ${currentTimeToTarget.months > 0 ? `${currentTimeToTarget.months} m.` : ''}`
                      : `> 50 let`}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    {timeSavedComparison ? `Ušetříte ${timeSavedComparison.years} r. ${timeSavedComparison.months} m.` : `Při výnosu ${annualReturnRate} % p.a.`}
                  </p>
                </div>
              </div>

              {/* DEDICATED SHOWCASE: Interaktivní modelování ročního zhodnocení ETF & Zkrácení cesty */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#161618] to-[#121215] border border-emerald-500/25 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        Modelování zhodnocení ETF fondů a zkrácení cesty
                      </h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        Posouvejte výnos a sledujte v reálném čase, o kolik let vám vyšší zhodnocení ušetří cestu k nezávislosti.
                      </p>
                    </div>
                  </div>

                  {/* Big Return Percentage Display */}
                  <div className="flex items-center gap-2 bg-[#0d0d0f] px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto shrink-0">
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                      Výnos:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                      {annualReturnRate.toFixed(1)} % p.a.
                    </span>
                  </div>
                </div>

                {/* Interactive Slider with dynamic gradient */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs text-white/50 font-medium">
                    <span>3.0 % (Konzervativní)</span>
                    <span className="text-emerald-400 font-bold">{annualReturnRate.toFixed(1)} % ročně</span>
                    <span>15.0 % (Agresivní)</span>
                  </div>
                  <input
                    id="slider-interactive-annual-return"
                    type="range"
                    min="3.0"
                    max="15.0"
                    step="0.5"
                    value={annualReturnRate}
                    onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                    className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                {/* Quick Presets for standard ETF portfolios */}
                <div>
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block mb-2">
                    Přednastavené strategie ETF fondů (klikněte pro vyzkoušení):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ETF_RETURN_PRESETS.map((p) => {
                      const isActive = annualReturnRate === p.rate;
                      return (
                        <button
                          key={p.rate}
                          type="button"
                          onClick={() => setAnnualReturnRate(p.rate)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                              : 'bg-[#121214] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{p.label}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                              {p.rate} %
                            </span>
                          </div>
                          <p className="text-[10px] text-white/40 line-clamp-1">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Comparison Box: How much time is saved? */}
                <div className="p-3.5 bg-[#0d0d0f] rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Stat 1 */}
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase font-semibold">
                        Doba k nezávislosti
                      </span>
                      <span className="text-white font-bold text-sm tabular-nums">
                        {currentTimeToTarget
                          ? `${currentTimeToTarget.years} let ${currentTimeToTarget.months} měs.`
                          : 'Více než 50 let'}
                      </span>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#d4af37] shrink-0" />
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase font-semibold">
                        Zkrácení cesty (vs. 5 % p.a.)
                      </span>
                      <span className="text-[#d4af37] font-bold text-sm tabular-nums">
                        {timeSavedComparison
                          ? `-${timeSavedComparison.years} let ${timeSavedComparison.months} měs.`
                          : annualReturnRate <= 5
                          ? 'Základní scénář'
                          : 'Překročí 50 let'}
                      </span>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-white/40 block text-[10px] uppercase font-semibold">
                        Navýšení zisku za 10 let
                      </span>
                      <span className="text-emerald-400 font-bold text-sm tabular-nums">
                        +{formatCZK(extraGainsAt10Years)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Chart & Projections */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Křivka složeného úročení a růstu majetku (10 let)
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      Zelená plocha představuje zisk z ETF fondů ({annualReturnRate} % p.a.), zlatá vaše vlastní vklady.
                    </p>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-white/60">Zisk z investic</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                      <span className="text-white/60">Vlastní vklady</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-t border-dashed border-rose-400" />
                      <span className="text-white/60">Cíl</span>
                    </div>
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="relative w-full overflow-hidden bg-[#0d0d0f] rounded-xl p-2 border border-white/5">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible block"
                    style={{ maxHeight: '250px' }}
                  >
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75, 1].map((p) => {
                      const y = chartHeight - paddingY - p * (chartHeight - paddingY * 2);
                      return (
                        <line
                          key={p}
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="rgba(255,255,255,0.06)"
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Target line (Financial Independence) */}
                    {targetLineY >= paddingY && (
                      <g>
                        <line
                          x1={paddingX}
                          y1={targetLineY}
                          x2={chartWidth - paddingX}
                          y2={targetLineY}
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="5 4"
                        />
                        <text
                          x={chartWidth - paddingX}
                          y={targetLineY - 6}
                          textAnchor="end"
                          fill="#f43f5e"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          Cíl 100% svobody ({formatCZK(financialIndependenceTarget)})
                        </text>
                      </g>
                    )}

                    {/* Total Balance Area (Compound Growth) */}
                    <polygon points={balanceArea} fill="url(#growthGradient)" />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={balancePoints}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Deposited Area */}
                    <polygon points={depositArea} fill="url(#depositGradient)" />
                    <polyline
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="1.5"
                      points={depositPoints}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Year axis labels and hover points */}
                    {yearlyData.map((d) => {
                      const cx = getX(d.year);
                      const cy = getY(d.totalBalance);
                      const isHovered = hoveredYear === d.year;

                      return (
                        <g key={d.year} className="cursor-pointer" onMouseEnter={() => setHoveredYear(d.year)}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 6 : 3.5}
                            fill={isHovered ? '#10b981' : '#121214'}
                            stroke="#10b981"
                            strokeWidth="2"
                            className="transition-all duration-150"
                          />
                          <text
                            x={cx}
                            y={chartHeight - 6}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.4)"
                            fontSize="10"
                            fontWeight="600"
                          >
                            {d.year === 0 ? 'Dnes' : `${d.year}.r`}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Year Details Callout */}
                  {hoveredYear !== null && (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#d4af37]">
                          {hoveredYear === 0 ? 'Aktuální stav:' : `Stav po ${hoveredYear} letech:`}
                        </span>
                        <span className="font-bold text-white">
                          {formatCZK(yearlyData[hoveredYear].totalBalance)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/70">
                        <span>Vloženo: <strong>{formatCZK(yearlyData[hoveredYear].totalDeposited)}</strong></span>
                        <span>Zisk (úrok): <strong className="text-emerald-400">+{formatCZK(yearlyData[hoveredYear].compoundInterest)}</strong></span>
                        <span>Pasivní příjem: <strong className="text-emerald-400">{formatCZK(yearlyData[hoveredYear].monthlyPassiveIncome)}/měs</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls & Parameters: Auto vs Custom Simulation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-[#d4af37]" />
                    <h3 className="text-sm font-bold text-white">
                      Nastavení výše vkladů a životních nákladů
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-toggle-auto-sync"
                      onClick={handleToggleAutoSync}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        useAutoSync
                          ? 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                      }`}
                    >
                      {useAutoSync ? '✓ Propojeno se džbánem Svoboda' : 'Vlastní simulace (odpojeno)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Input: Měsíční investice */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                        Měsíční investice do FFA
                      </label>
                      <span className="text-xs font-bold text-emerald-400 tabular-nums">
                        {formatCZK(monthlyInvestment)}/měs
                      </span>
                    </div>
                    <input
                      id="slider-monthly-investment"
                      type="range"
                      min="1000"
                      max="100000"
                      step="500"
                      disabled={useAutoSync}
                      value={monthlyInvestment}
                      onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                    <span className="text-[10px] text-white/40">
                      {useAutoSync ? `Automaticky ${freedomJar?.percentage || 10} % z příjmu ${formatCZK(monthlyIncome)}` : 'Ručně nastavená částka'}
                    </span>
                  </div>

                  {/* Input: Cílový měsíční pasivní příjem */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                        Cílový pasivní příjem
                      </label>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {formatCZK(targetMonthlyPassive)}/měs
                      </span>
                    </div>
                    <input
                      id="slider-target-passive"
                      type="range"
                      min="10000"
                      max="150000"
                      step="1000"
                      value={targetMonthlyPassive}
                      onChange={(e) => {
                        setTargetMonthlyPassive(Number(e.target.value));
                        setUseAutoSync(false);
                      }}
                      className="w-full accent-[#d4af37] cursor-pointer"
                    />
                    <span className="text-[10px] text-white/40">
                      Částka, kterou potřebujete měsíčně pro život bez nutnosti pracovat
                    </span>
                  </div>
                </div>
              </div>

              {/* Three Freedom Milestones (Smart Life Methodology) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#d4af37]" />
                  Milníky finanční nezávislosti (Smart Life)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Milestone 1 */}
                  <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                        1. Základní svoboda (Lean)
                      </span>
                      <span className="text-xs font-bold text-[#d4af37]">
                        {milestoneLean ? `Za ${milestoneLean.year} let` : '> 10 let'}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {formatCZK(Math.round(financialIndependenceTarget * 0.33))}
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Pasivní příjem pokrývá 33 % nákladů (cca {formatCZK(Math.round(targetMonthlyPassive * 0.33))}/měs). Zajišťuje základní přežití a klid.
                    </p>
                  </div>

                  {/* Milestone 2 */}
                  <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        2. Poloviční svoboda (Barista)
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {milestoneBarista ? `Za ${milestoneBarista.year} let` : '> 10 let'}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {formatCZK(Math.round(financialIndependenceTarget * 0.66))}
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Pasivní příjem pokrývá 66 % nákladů ({formatCZK(Math.round(targetMonthlyPassive * 0.66))}/měs). Můžete pracovat jen na částečný úvazek.
                    </p>
                  </div>

                  {/* Milestone 3 */}
                  <div className="p-4 rounded-xl bg-[#161618] border border-[#d4af37]/30 bg-gradient-to-br from-[#161618] to-[#1a1813] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37]">
                        3. Úplná nezávislost (FIRE)
                      </span>
                      <span className="text-xs font-bold text-[#d4af37]">
                        {milestoneFull ? `Za ${milestoneFull.year} let` : '> 10 let'}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white">
                      {formatCZK(financialIndependenceTarget)}
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed">
                      100% finanční svoboda ({formatCZK(targetMonthlyPassive)}/měs). Pasivní příjem z ETF plně hradí veškeré životní náklady.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-white/5 bg-[#161618]">
          <span className="text-xs text-white/40 hidden sm:inline">
            Založeno na principech Smart Life & Trinity Study
          </span>
          <button
            type="button"
            id="btn-close-fi-bottom"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all cursor-pointer ml-auto"
          >
            Rozumím, pokračovat k rozpočtu
          </button>
        </div>
      </div>
    </div>
  );
};
