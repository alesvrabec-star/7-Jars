import React, { useState, useEffect, useMemo } from 'react';
import { Jar, Transaction } from '../types';
import { formatCZK } from '../utils/formatters';
import {
  X,
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  ArrowRight,
  RefreshCw,
  Zap,
  Award,
  Layers,
  ChevronRight,
  CheckSquare,
  Square,
  ListTodo,
  Coins,
  Lock,
} from 'lucide-react';

interface FinancialCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  monthlyIncome: number;
  transactions: Transaction[];
  currentMonthName?: string;
  onOpenDistribute?: () => void;
}

interface CoachAuditResult {
  coachScore: number;
  statusTitle: string;
  executiveSummary: string;
  threeActionSteps: string[];
  marketInsight: string;
  freedomOutlook: string;
  marketBenchmarks?: {
    sp500: { name: string; ytdReturn: string; trend: string };
    msciWorld: { name: string; ytdReturn: string; trend: string };
    nasdaq100: { name: string; ytdReturn: string; trend: string };
    czechInflation: { name: string; rate: string; trend: string };
    cnbRepoRate?: { name: string; rate: string; trend: string };
  };
  isAiGenerated?: boolean;
}

const STORAGE_KEY_TASKS = 'seven_jars_coach_tasks_completed_v1';

export const FinancialCoachModal: React.FC<FinancialCoachModalProps> = ({
  isOpen,
  onClose,
  jars,
  monthlyIncome,
  transactions,
  currentMonthName = 'Aktuální měsíc',
  onOpenDistribute,
}) => {
  // Navigation tabs: Úkoly | Hodnocení hospodaření | Akční doporučení | Trhy
  const [activeTab, setActiveTab] = useState<'tasks' | 'audit' | 'recommendations' | 'markets'>('tasks');
  const [auditResult, setAuditResult] = useState<CoachAuditResult | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Completed task ids persisted in localStorage
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save task state to localStorage', err);
      }
      return updated;
    });
  };

  // Core jar lookups
  const freedomJar = jars.find((j) => j.id === 'freedom');
  const emergencyJar = jars.find((j) => j.id === 'emergency');
  const necessitiesJar = jars.find((j) => j.id === 'necessities');
  const playJar = jars.find((j) => j.id === 'play');

  const freedomBalance = freedomJar?.balance || 0;
  const emergencyBalance = emergencyJar?.balance || 0;
  const necessitiesBalance = necessitiesJar?.balance || 0;

  const monthlyNecessitiesLimit = Math.round((monthlyIncome * (necessitiesJar?.percentage || 50)) / 100);
  const monthlyFreedomInvestment = Math.round((monthlyIncome * (freedomJar?.percentage || 10)) / 100);
  const emergencyMonthsCovered = monthlyNecessitiesLimit > 0
    ? (emergencyBalance / monthlyNecessitiesLimit).toFixed(1)
    : '0';

  const isEmergencySufficient = parseFloat(emergencyMonthsCovered) >= 3;
  const emergencyNeededFor3Months = Math.max(0, monthlyNecessitiesLimit * 3 - emergencyBalance);

  // Dynamic milestone based on Freedom Jar balance
  const nextMilestone = useMemo(() => {
    if (freedomBalance < 50000) return 50000;
    if (freedomBalance < 100000) return 100000;
    if (freedomBalance < 250000) return 250000;
    if (freedomBalance < 500000) return 500000;
    if (freedomBalance < 1000000) return 1000000;
    return Math.ceil((freedomBalance + 1) / 500000) * 500000;
  }, [freedomBalance]);

  const remainingToMilestone = Math.max(0, nextMilestone - freedomBalance);
  const monthsToMilestone = monthlyFreedomInvestment > 0
    ? Math.ceil(remainingToMilestone / monthlyFreedomInvestment)
    : 0;

  // Dynamic tasks based on Freedom Jar balance and income
  const dynamicTasks = useMemo(() => {
    return [
      {
        id: 'task-etf-investment',
        title: freedomBalance > 0
          ? `Odeslat ${formatCZK(freedomBalance)} z Džbánu svobody do ETF fondu`
          : `Zajistit měsíční vklad ${formatCZK(monthlyFreedomInvestment)} do Džbánu svobody`,
        description: freedomBalance > 0
          ? `Ve Džbánu svobody máte aktuálně naspořeno ${formatCZK(freedomBalance)}. Nenechávejte tyto peníze ležet na běžném účtu bez úroku – zadejte u brokera nákup nízkonákladového ETF (např. S&P 500 nebo MSCI World).`
          : `Z nejbližší výplaty pošlete celých ${formatCZK(monthlyFreedomInvestment)} (${freedomJar?.percentage || 10} %) do Džbánu svobody a ihned zadejte nákupní pokyn na ETF.`,
        tag: 'Pravidelné investování',
        priority: 'Vysoká priorita',
        amount: freedomBalance > 0 ? freedomBalance : monthlyFreedomInvestment,
      },
      {
        id: 'task-portfolio-milestone',
        title: `Pokořit milník ${formatCZK(nextMilestone)} ve Džbánu svobody`,
        description: `Aktuální zůstatek je ${formatCZK(freedomBalance)}. K dosažení milníku ${formatCZK(nextMilestone)} chybí ${formatCZK(remainingToMilestone)} (při vašem tempu cca ${monthsToMilestone} měsíců). Každá koruna navíc zkracuje dobu k cíli.`,
        tag: 'Milník portfolia',
        priority: 'Klíčový cíl',
        badge: `${Math.min(100, Math.round((freedomBalance / nextMilestone) * 100))} % splněno`,
      },
      {
        id: 'task-golden-rule-lock',
        title: 'Dodržet zásadu „Zlaté slepice“ (Zákaz spotřebních výdajů)',
        description: 'Ověřte, že ze Džbánu svobody neodešla v tomto měsíci žádná platba za běžné výdaje, nákupy či dovolenou. Peníze v tomto džbánu slouží výhradně k produkci pasivního příjmu a jsou nedotknutelné.',
        tag: 'Ochrana kapitálu',
        priority: 'Zásadní pravidlo',
      },
      {
        id: 'task-standing-order-check',
        title: `Ověřit trvalý příkaz na ${formatCZK(monthlyFreedomInvestment)} den po výplatě`,
        description: 'Zkontrolujte, že máte v internetovém bankovnictví nastaven trvalý převod do investic na den bezprostředně po výplatě. Automatizace zaručí, že „nejdříve zaplatíte sobě samému“ dříve, než peníze stihnete utratit.',
        tag: 'Automatizace rozpočtu',
        priority: 'Doporučení',
      },
      {
        id: 'task-accumulating-etf',
        title: 'Zkontrolovat akumulační režim ETF fondů (Acc)',
        description: 'Ujistěte se, že vámi kupované ETF fondy mají v názvu označení „Acc“ (Accumulating). Dividendy se tak automaticky reinvestují bez nutnosti vašeho zásahu, což maximalizuje složené úročení a po 3 letech je v ČR výnos osvobozen od daně.',
        tag: 'Daňová efektivita',
        priority: 'Optimalizace',
      },
    ];
  }, [freedomBalance, monthlyFreedomInvestment, freedomJar, nextMilestone, remainingToMilestone, monthsToMilestone]);

  const completedCount = dynamicTasks.filter((t) => completedTaskIds[t.id]).length;
  const totalTasks = dynamicTasks.length;
  const taskProgressPct = Math.round((completedCount / totalTasks) * 100);

  // Fetch coach audit from server API
  const handleRunAudit = async () => {
    setIsLoadingAudit(true);
    setAuditError(null);

    try {
      const response = await fetch('/api/coach-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jars,
          monthlyIncome,
          transactions,
          currentMonthName,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst zhodnocení kouče');
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.warn('Fallback to local evaluation:', err);
      // Fallback local calculation
      setAuditResult({
        coachScore: isEmergencySufficient ? 88 : 70,
        statusTitle: isEmergencySufficient ? 'Skvělá disciplína a pevné základy' : 'Priorita: Posílení nouzové rezervy',
        executiveSummary: `Tento měsíc hospodaříš s příjmem ${formatCZK(monthlyIncome)}. Tvůj Džbán finanční svobody má ${formatCZK(freedomJar?.balance || 0)} a rezerva pokrývá ${emergencyMonthsCovered} měsíce výdajů.`,
        threeActionSteps: [
          isEmergencySufficient
            ? `Investuj celých ${formatCZK(monthlyFreedomInvestment)} do nízkonákladového ETF fondu (např. S&P 500 nebo MSCI World).`
            : `Doplň nouzovou rezervu o ${formatCZK(Math.min(emergencyNeededFor3Months, 10000))}, abys dosáhl klidných 3 měsíců.`,
          `Udržuj Džbán nutností pod stropem 50 % příjmu (${formatCZK(monthlyNecessitiesLimit)}).`,
          `Z Džbánu na radost bez výčitek utrať za to, co tě těší – finanční svoboda je maraton, ne sprint.`,
        ],
        marketInsight: 'Globální trhy (MSCI World i S&P 500) letos rostou o více než 15 %. Pravidelné měsíční investování ze Džbánu svobody spolehlivě překonává pokusy o časování trhu.',
        freedomOutlook: 'Při pravidelném investování a dodržování pravidla 4 % směřuješ k plné finanční nezávislosti do 10 let.',
        isAiGenerated: false,
      });
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Run audit automatically once on opening audit tab if empty
  useEffect(() => {
    if (isOpen && activeTab === 'audit' && !auditResult && !isLoadingAudit) {
      handleRunAudit();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      id="financial-coach-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Osobní finanční kouč Smart Life
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Mentoring & Strategie
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Konkrétní úkoly pro Džbán svobody, hodnocení hospodaření a akční doporučení.
              </p>
            </div>
          </div>
          <button
            id="btn-close-coach-modal"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - 4 Clear Distinct Areas */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-white/5 bg-[#141416] overflow-x-auto scrollbar-none">
          {/* Tab 1: Úkoly na tento měsíc */}
          <button
            type="button"
            id="tab-coach-tasks"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListTodo className="w-4 h-4 text-[#d4af37]" />
            <span>Úkoly na tento měsíc</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/10 font-bold tabular-nums">
              {completedCount}/{totalTasks}
            </span>
          </button>

          {/* Tab 2: Měsíční hodnocení hospodaření (Audit) */}
          <button
            type="button"
            id="tab-coach-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Hodnocení hospodaření</span>
          </button>

          {/* Tab 3: Akční doporučení kouče */}
          <button
            type="button"
            id="tab-coach-recommendations"
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'recommendations'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Akční doporučení</span>
          </button>

          {/* Tab 4: Trhy & ETF benchmarky */}
          <button
            type="button"
            id="tab-coach-markets"
            onClick={() => setActiveTab('markets')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'markets'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Trhy & ETF</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: ÚKOLY NA TENTO MĚSÍC (ZALOŽENO NA DŽBÁNU SVOBODA) */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Header Box with Progress & Freedom Jar Balance */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#161618] via-[#141417] to-[#121214] border border-[#d4af37]/30 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] block mb-1">
                      Kroky k finanční nezávislosti • {currentMonthName}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-[#d4af37]" />
                      Konkrétní úkoly pro Džbán finanční svobody
                    </h3>
                  </div>

                  {/* Freedom Balance Status Tag */}
                  <div className="flex items-center gap-2.5 bg-[#0d0d0f] p-2.5 px-3.5 rounded-xl border border-white/10 shrink-0">
                    <Coins className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-white/40 block">
                        Zůstatek ve Svobodě
                      </span>
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">
                        {formatCZK(freedomBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Zde jsou vaše konkrétní úkoly vygenerované na základě aktuálního zůstatku ve Džbánu svobody. Jakmile úkol splníte, odškrtněte jej.
                </p>

                {/* Progress Bar Container */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium">
                      Splněno: <strong className="text-white font-bold">{completedCount}</strong> z {totalTasks} úkolů
                    </span>
                    <span className="font-bold text-[#d4af37] tabular-nums">
                      {taskProgressPct} %
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${taskProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestone celebration if 100% */}
                {taskProgressPct === 100 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Všechny úkoly na tento měsíc máte splněné!</strong> Váš Džbán svobody pracuje na plný výkon a vaše cesta k nezávislosti se zkracuje.
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Task List */}
              <div className="space-y-2.5">
                {dynamicTasks.map((task) => {
                  const isChecked = !!completedTaskIds[task.id];

                  return (
                    <div
                      key={task.id}
                      id={`coach-task-${task.id}`}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#141416] border-emerald-500/30 opacity-75'
                          : 'bg-[#161618] border-white/10 hover:border-white/25 hover:bg-[#19191d]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Custom Checkbox Button */}
                        <button
                          type="button"
                          aria-checked={isChecked}
                          className={`mt-0.5 p-1 rounded-lg shrink-0 transition-colors ${
                            isChecked
                              ? 'text-emerald-400 bg-emerald-500/15'
                              : 'text-white/40 hover:text-white bg-white/5'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4
                              className={`text-sm font-bold transition-all ${
                                isChecked
                                  ? 'text-white/60 line-through'
                                  : 'text-white'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                                {task.tag}
                              </span>
                              {task.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {task.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-white/60 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Link to Income Distributor */}
              {onOpenDistribute && (
                <div className="pt-2 flex justify-between items-center text-xs text-white/50">
                  <span>Chcete rozdělit novou výplatu do Džbánu svobody?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDistribute();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0a0a0b] font-bold hover:brightness-110 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Přejít k rozdělení příjmu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MĚSÍČNÍ HODNOCENÍ HOSPODAŘENÍ (RETROSPEKTIVA & AUDIT) */}
          {activeTab === 'audit' && (
            <div className="space-y-5">
              {/* Distinctive Header for Monthly Audit */}
              <div className="p-4 rounded-xl bg-[#141824] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-0.5">
                      Retrospektivní audit • Minulý měsíc
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Měsíční hodnocení hospodaření a disciplíny
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Podrobný rozbor toho, jak jste hospodařili se svými příjmy a džbány v {currentMonthName}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-refresh-audit"
                  onClick={handleRunAudit}
                  disabled={isLoadingAudit}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAudit ? 'Analyzuji...' : 'Aktualizovat audit'}</span>
                </button>
              </div>

              {isLoadingAudit ? (
                <div className="p-12 text-center space-y-3 bg-[#161618] rounded-2xl border border-white/5">
                  <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">Kouč analyzuje vaše hospodaření za {currentMonthName}...</p>
                  <p className="text-xs text-white/40">Vyhodnocujeme rozpočet Sedmi džbánů, míru úspor a platební disciplínu</p>
                </div>
              ) : auditResult ? (
                <div className="space-y-4">
                  {/* Score Card - VISUALLY DISTINCT AUDIT THEME (Blue / Gold) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#131622] via-[#161a29] to-[#0f111a] border border-blue-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between gap-4 border-b border-blue-500/15 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                          Výsledné skóre hospodaření
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {auditResult.statusTitle}
                        </h4>
                      </div>

                      <div className="text-right shrink-0 bg-[#0c0e14] p-3 px-4 rounded-xl border border-blue-500/20">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#d4af37] tabular-nums">
                          {auditResult.coachScore}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 block">
                          ze 100 bodů
                        </span>
                      </div>
                    </div>

                    {/* Executive verbal analysis */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                        Slovní rozbor kouče:
                      </span>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed bg-[#0c0e14] p-3.5 rounded-xl border border-white/5">
                        {auditResult.executiveSummary}
                      </p>
                    </div>

                    {/* Breakdown metrics strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-2.5 bg-[#0c0e14] rounded-xl border border-white/5 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-white/40 block">
                          Měsíční příjem
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatCZK(monthlyIncome)}
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#0c0e14] rounded-xl border border-white/5 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-white/40 block">
                          Míra úspor do Svobody
                        </span>
                        <span className="text-sm font-bold text-emerald-400 tabular-nums">
                          {freedomJar?.percentage || 10} % ({formatCZK(monthlyFreedomInvestment)})
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#0c0e14] rounded-xl border border-white/5 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-white/40 block">
                          Nouzová rezerva
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {emergencyMonthsCovered} měsíce výdajů
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch to Action Recommendations Link */}
                  <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <span className="text-white/60">
                      Chcete vidět strategický plán a doporučení pro další období?
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('recommendations')}
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer shrink-0"
                    >
                      <span>Přejít k akčním doporučením</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: AKČNÍ DOPORUČENÍ KOUČE (STRATEGIE A BUDOUCÍ KROKY) */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {/* Distinctive Header for Strategic Recommendations (Emerald / Gold) */}
              <div className="p-4 rounded-xl bg-[#121c15] border border-emerald-500/30 flex items-start gap-3 shadow-lg">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-0.5">
                    Strategický výhled • Pro další období
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Akční doporučení a strategie k finanční nezávislosti
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    Strategické kroky podle filozofie Smart Life: co přesně udělat s rozpočtem v příštích týdnech, aby se vaše cesta k nezávislosti zkrátila.
                  </p>
                </div>
              </div>

              {/* 3 Pillar Strategic Action Cards */}
              <div className="space-y-3">
                {/* Pillar 1: Reserve & Security */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isEmergencySufficient
                      ? 'bg-[#161618] border-emerald-500/20'
                      : 'bg-[#161618] border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isEmergencySufficient
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                          Pilíř 1
                        </span>
                        <h5 className="text-sm font-bold text-white">
                          Nouzový polštář: Ochrana před nuceným prodejem investic
                        </h5>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Aktuální stav rezervy je <strong>{formatCZK(emergencyBalance)}</strong> ({emergencyMonthsCovered} měsíce výdajů).
                        Pokud přijde nečekaný výdaj nebo výpadek příjmu, díky rezervě nemusíte prodávat ETF fondy ve ztrátě.
                      </p>
                      {!isEmergencySufficient ? (
                        <p className="text-xs text-amber-300 font-medium pt-1">
                          👉 <strong>Doporučení:</strong> Doplňte ještě {formatCZK(emergencyNeededFor3Months)} do Džbánu rezervy, abyste dosáhli bezpečného 3měsíčního pásma.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-400 font-medium pt-1">
                          👉 <strong>Skvělá práce:</strong> Základna je stabilní. Můžete bez obav posílat maximum přebytků do Džbánu svobody.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pillar 2: Freedom & ETF Power */}
                <div className="p-4 rounded-xl bg-[#161618] border border-[#d4af37]/30 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#d4af37]/15 text-[#d4af37] shrink-0 mt-0.5">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                          Pilíř 2
                        </span>
                        <h5 className="text-sm font-bold text-white">
                          Džbán finanční svobody: Pravidelné nákupy širokých indexů
                        </h5>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Měsíčně náleží do Džbánu svobody částka <strong>{formatCZK(monthlyFreedomInvestment)}</strong>.
                        Tuto částku posílejte na investiční účet bez ohledu na to, zda média hlásí růst nebo pokles trhů.
                      </p>
                      <p className="text-xs text-emerald-300 font-medium pt-1">
                        👉 <strong>Pravidlo růstu:</strong> Pokud získáte mimořádný příjem (prémie, daňový bonus), pošlete alespoň 50 % přímo do Džbánu svobody. Zkrátíte si cestu k nezávislosti o měsíce až roky.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pillar 3: Anti-Lifestyle Inflation & Joy */}
                <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0 mt-0.5">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                          Pilíř 3
                        </span>
                        <h5 className="text-sm font-bold text-white">
                          Boj s inflací životního stylu a radost bez výčitek
                        </h5>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        - <strong>Džbán nutností:</strong> Držte výdaje pod 50 % příjmu (strop {formatCZK(monthlyNecessitiesLimit)}).<br />
                        - <strong>Džbán na radost:</strong> Zůstatek {formatCZK(playJar?.balance || 0)} je určen k bezvýčitkovému utrácení za zážitky. Udržitelné bohatství vyžaduje mentální svěžest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic steps from AI audit if available */}
              {auditResult?.threeActionSteps && auditResult.threeActionSteps.length > 0 && (
                <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-2.5">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-white/50">
                    Konkrétní akční úkoly od kouče na další měsíc:
                  </h5>
                  <div className="space-y-2">
                    {auditResult.threeActionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-[#121214] rounded-lg border border-white/5 text-xs text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRHY & ETF BENCHMARKY */}
          {activeTab === 'markets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#161618] border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  Aktuální tržní data & indexy pro ETF investování
                </h4>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Jako dlouhodobý investor podle filozofie Smart Life nespekulujete na jednotlivé akcie. Váš Džbán finanční svobody kupuje celosvětový trh, který historicky neustále roste.
                </p>
              </div>

              {/* Benchmark Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">S&P 500 (USA 500 největších firem)</span>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      +22.4 % YTD
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Základní pilíř většiny portfolií. Zahrnuje lídry jako Apple, Microsoft, NVIDIA, Amazon.
                  </p>
                </div>

                <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">MSCI World (Globální rozvinuté trhy)</span>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      +17.8 % YTD
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Extrémně diverzifikované portfolio napříč 23 zeměmi světa. Menší kolísavost než čisté USA.
                  </p>
                </div>

                <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Nasdaq 100 (Technologický sektor)</span>
                    <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      +24.1 % YTD
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Vysoký růstový potenciál, ale také vyšší propady během korekcí trhu.
                  </p>
                </div>

                <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Česká inflace vs. Sazby ČNB</span>
                    <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      Inflace 2.6 % | Sazba 4.0 %
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Peníze na běžném účtu ztrácí kupní sílu. Džbán rezervy patří na spořicí účet, Džbán svobody do ETF.
                  </p>
                </div>
              </div>

              {/* Smart Life Golden Rule on Markets */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#161618] to-[#121214] border border-white/10 flex items-start gap-3 text-xs text-white/70">
                <div className="p-2 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    Zlaté pravidlo Smart Life: Trhy nečasujte, pravidelně nakupujte
                  </p>
                  <p className="text-white/50 mt-1 leading-relaxed">
                    Když trhy klesají, nakupujete ETF levněji ve slevě. Když rostou, vaše stávající portfolio bohatne. Pravidelný nákup každý měsíc po výplatě je nejspolehlivější cestou k pasivnímu příjmu do 10 let.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-white/5 bg-[#161618]">
          <span className="text-xs text-white/40 hidden sm:inline">
            Metoda Sedmi džbánů & Smart Life (Tomáš Pieružek)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl shadow-lg shadow-[#d4af37]/10 transition-all cursor-pointer ml-auto"
          >
            Zavřít kouče
          </button>
        </div>
      </div>
    </div>
  );
};
