import React, { useState, useEffect } from 'react';
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
  };
  isAiGenerated?: boolean;
}

export const FinancialCoachModal: React.FC<FinancialCoachModalProps> = ({
  isOpen,
  onClose,
  jars,
  monthlyIncome,
  transactions,
  currentMonthName = 'Aktuální měsíc',
  onOpenDistribute,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'audit' | 'markets'>('plan');
  const [auditResult, setAuditResult] = useState<CoachAuditResult | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Core jar lookups
  const freedomJar = jars.find((j) => j.id === 'freedom');
  const emergencyJar = jars.find((j) => j.id === 'emergency');
  const necessitiesJar = jars.find((j) => j.id === 'necessities');
  const playJar = jars.find((j) => j.id === 'play');

  const monthlyNecessitiesLimit = Math.round((monthlyIncome * (necessitiesJar?.percentage || 50)) / 100);
  const monthlyFreedomInvestment = Math.round((monthlyIncome * (freedomJar?.percentage || 10)) / 100);
  const emergencyMonthsCovered = monthlyNecessitiesLimit > 0
    ? ((emergencyJar?.balance || 0) / monthlyNecessitiesLimit).toFixed(1)
    : '0';

  const isEmergencySufficient = parseFloat(emergencyMonthsCovered) >= 3;
  const emergencyNeededFor3Months = Math.max(0, monthlyNecessitiesLimit * 3 - (emergencyJar?.balance || 0));

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
                Váš průvodce hospodařením, investováním do ETF a cestou k nezávislosti.
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

        {/* Tab Navigation */}
        <div className="shrink-0 flex items-center gap-1 px-4 sm:px-6 pt-3 pb-2 border-b border-white/5 bg-[#141416]">
          <button
            type="button"
            id="tab-coach-plan"
            onClick={() => setActiveTab('plan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'plan'
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Co přesně dělat tento měsíc</span>
          </button>

          <button
            type="button"
            id="tab-coach-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Měsíční hodnocení & Zpětná vazba</span>
          </button>

          <button
            type="button"
            id="tab-coach-markets"
            onClick={() => setActiveTab('markets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'markets'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Trhy & ETF benchmarky</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: CO PŘESNĚ DĚLAT TENTO MĚSÍC (AKČNÍ PLÁN) */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#161618] to-[#121214] border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Váš osobní 3-krokový akční plán na {currentMonthName}
                  </h4>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Nemusíte nic složitě počítat. Zde jsou 3 jasné instrukce podle filozofie Smart Life: jak naložit s příjmem {formatCZK(monthlyIncome)}, abyste do 10 let dosáhli finanční nezávislosti.
                  </p>
                </div>
              </div>

              {/* Step 1: Emergency Reserve Check */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isEmergencySufficient
                    ? 'bg-[#161618] border-emerald-500/20'
                    : 'bg-[#161618] border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                          Krok 1
                        </span>
                        <h5 className="text-sm font-bold text-white">
                          Nouzová rezerva: Bezpečný polštář
                        </h5>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isEmergencySufficient
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isEmergencySufficient ? 'Zajištěno (3+ měsíce)' : 'Doporučit posílit'}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Aktuální stav rezervy: <strong>{formatCZK(emergencyJar?.balance || 0)}</strong> (pokrývá cca <strong>{emergencyMonthsCovered} měsíce</strong> nutných životních nákladů).
                      </p>
                      {!isEmergencySufficient ? (
                        <p className="text-xs text-amber-300 font-medium pt-1">
                          👉 <strong>Doporučení kouče:</strong> Než začnete masivně investovat, doplňte rezervu na 3 měsíce (chybí cca {formatCZK(emergencyNeededFor3Months)}). Tento měsíc pošlete do rezervy alespoň {formatCZK(Math.min(emergencyNeededFor3Months, 5000))}.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-400 font-medium pt-1">
                          👉 <strong>Výborně!</strong> Rezerva je pevná. Nemusíte do ní přidávat víc, než je stanovené procento, a můžete se naplno soustředit na investování.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Freedom Jar & ETF Investing */}
              <div className="p-4 rounded-xl bg-[#161618] border border-[#d4af37]/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#d4af37]/15 text-[#d4af37] shrink-0 mt-0.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                        Krok 2
                      </span>
                      <h5 className="text-sm font-bold text-white">
                        Džbán finanční svobody: Nákup nízkonákladového ETF
                      </h5>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Z tohoto měsíčního příjmu patří do Džbánu svobody přesně:
                    </p>
                    <div className="p-3 bg-[#121214] rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white/70">Měsíční vklad na investice:</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        {formatCZK(monthlyFreedomInvestment)} ({freedomJar?.percentage || 10} %)
                      </span>
                    </div>
                    <p className="text-xs text-white/70 pt-1 leading-relaxed">
                      👉 <strong>Co přesně udělat:</strong> Tuto částku pošlete na svůj investiční účet (např. u spolehlivého brokera) a nakupte široký indexový ETF fond (např. <strong>S&P 500</strong> nebo <strong>MSCI World</strong>). Tyto peníze <strong>nikdy neutrácíte</strong> – slouží jako motor pasivního příjmu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Life Balance & Guilt-Free Spending */}
              <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Krok 3
                      </span>
                      <h5 className="text-sm font-bold text-white">
                        Radost bez výčitek a limit na nutnosti
                      </h5>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      - <strong>Džbán nutností:</strong> Strop pro tento měsíc je <strong>{formatCZK(monthlyNecessitiesLimit)}</strong> (nájem, jídlo, energie).<br />
                      - <strong>Džbán na radost (Hry):</strong> Máte k dispozici <strong>{formatCZK(playJar?.balance || 0)}</strong>. Tyto peníze <em>musíte</em> utratit za to, co vám dělá radost, abyste nevyhořeli.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onOpenDistribute && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDistribute();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0a0a0b] font-bold text-xs hover:brightness-110 shadow-lg shadow-[#d4af37]/10 transition-all cursor-pointer"
                  >
                    <span>Rozdělit příjem podle tohoto plánu</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MĚSÍČNÍ HODNOCENÍ & ZPĚTNÁ VAZBA (AI AUDIT) */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161618] border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    Vyhodnocení vašeho hospodaření za {currentMonthName}
                  </h4>
                  <p className="text-xs text-white/40 mt-0.5">
                    Kouč zanalyzuje vaše transakce, vklady do Džbánu svobody a aktuální stav trhů.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-refresh-audit"
                  onClick={handleRunAudit}
                  disabled={isLoadingAudit}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAudit ? 'Analyzuji...' : 'Přepočítat audit'}</span>
                </button>
              </div>

              {isLoadingAudit ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">Kouč analyzuje vaše finance a data z trhů...</p>
                  <p className="text-xs text-white/40">Vyhodnocujeme rozpočet Sedmi džbánů a trajektorii k nezávislosti</p>
                </div>
              ) : auditResult ? (
                <div className="space-y-4">
                  {/* Score & Summary Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#161618] to-[#121215] border border-emerald-500/25 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                          Hodnocení kouče
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {auditResult.statusTitle}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#d4af37] tabular-nums">
                          {auditResult.coachScore}
                        </span>
                        <span className="text-xs text-white/40 block">ze 100 bodů</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed bg-[#0d0d0f] p-3.5 rounded-xl border border-white/5">
                      {auditResult.executiveSummary}
                    </p>
                  </div>

                  {/* 3 Action Steps */}
                  <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-white/50">
                      Co konkrétně doporučuje kouč na příští měsíc:
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

                  {/* Market & Freedom Outlook */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block">
                        Tržní kontext pro tento měsíc
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {auditResult.marketInsight}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#161618] rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] block">
                        Výhled k 10leté svobodě
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {auditResult.freedomOutlook}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: TRHY & ETF BENCHMARKY */}
          {activeTab === 'markets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#161618] border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
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
