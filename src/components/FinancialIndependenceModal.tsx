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
  Search,
} from 'lucide-react';

interface FinancialIndependenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  monthlyIncome: number;
  onOpenCoach?: () => void;
}

export interface MetricExplanation {
  id: string;
  title: string;
  shortName: string;
  category: string;
  summary: string;
  details: string;
  formula?: string;
  example?: string;
  tip: string;
}

export const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  fiNumber: {
    id: 'fiNumber',
    title: 'Číslo finanční svobody (Cílový kapitál)',
    shortName: 'Cílový kapitál',
    category: 'Cílová metrika',
    summary: 'Celkový investiční majetek, který potřebujete nashromáždit, abyste mohli žít z pasivního příjmu bez nutnosti chodit do práce.',
    details: 'Vychází z celosvětově prověřeného pravidla 4 % (Trinity Study). Z této sumy můžete každoročně vybírat 4 % na veškeré životní náklady, a zbývající výnosy pokryjí inflaci, takže vám kapitál nikdy nedojde.',
    formula: 'Cílový kapitál = Roční životní náklady × 25 = Měsíční náklady × 300',
    example: 'Pokud na život potřebujete 25 000 Kč měsíčně (= 300 000 Kč ročně), vaše Číslo svobody je 7 500 000 Kč.',
    tip: 'Nejprve zamiřte na vykrytí Džbánu nutností (základní potřeby). Až dosáhnete tohoto milníku, budete mít klid a můžete svobodu dále navyšovat.',
  },
  passiveIncome10y: {
    id: 'passiveIncome10y',
    title: 'Pasivní příjem za 10 let',
    shortName: 'Měsíční pasivní příjem',
    category: 'Měsíční renta',
    summary: 'Měsíční částka v Kč, kterou vám portfolio bude spolehlivě vyplácet po 10 letech investování.',
    details: 'Počítá se jako bezpečný roční výběr 4 % z celkové budoucí hodnoty portfolia rozdělený na 12 měsíců. Tyto peníze představují vaši měsíční rentu bez nutnosti sahat na podstatu kapitálu.',
    formula: 'Měsíční pasivní příjem = (Hodnota portfolia za 10 let × 0,04) ÷ 12',
    example: 'Při naspořených 3 000 000 Kč činí bezpečný pasivní příjem 10 000 Kč každý měsíc.',
    tip: 'Každá koruna pasivního příjmu nahrazuje nutnost prodávat svůj čas v zaměstnání a zvyšuje vaši osobní svobodu.',
  },
  totalBalance10y: {
    id: 'totalBalance10y',
    title: 'Naspořeno a zhodnoceno (Celkový majetek)',
    shortName: 'Celkový majetek za 10 let',
    category: 'Stav portfolia',
    summary: 'Odhadovaná celková hodnota vašeho Džbánu svobody po 10 letech složeného úročení.',
    details: 'Je to součet všech vašich vlastních pravidelných vkladů a čistého zisku ze zhodnocení ETF fondů. Tento majetek je vaše „zlatá slepice“, která snáší pasivní příjem.',
    formula: 'Celkový majetek = Vlastní vklady + Zisk ze složeného úročení',
    example: 'Z celkových 2 000 000 Kč může být 600 000 Kč váš vklad a 1 400 000 Kč čistý výnos trhů.',
    tip: 'Tento majetek nikdy neutrácíte za spotřebu. Držíte jej zainvestovaný v ETF, odkud čerpáte pouze roční výnos.',
  },
  timeToTarget: {
    id: 'timeToTarget',
    title: 'Čas do dosažení cíle (Horizont nezávislosti)',
    shortName: 'Čas do cíle',
    category: 'Časový horizont',
    summary: 'Přesný počet let a měsíců, za jak dlouho při vašem tempu vkladů a zhodnocení dosáhnete 100% finanční nezávislosti.',
    details: 'Model počítá měsíc po měsíci s vaším počátečním stavem, měsíčními vklady a ročním výnosem ETF fondů. Zobrazuje, jak se horizont dramaticky zkracuje při vyšším zhodnocení.',
    formula: 'Měsíční simulace: Kapitál(m) = Kapitál(m-1) × (1 + r/12) + Vklad, dokud Kapitál >= Cíl',
    example: 'Zvýšením výnosu z 5 % na 8,5 % můžete zkrátit dobu ze 22 let na 14 let – ušetříte 8 let povinné práce!',
    tip: 'Dva největší urychlovače: Zvýšit měsíční vklad do Džbánu svobody a investovat do indexových ETF místo spořicích účtů.',
  },
  annualReturnRate: {
    id: 'annualReturnRate',
    title: 'Očekávaný roční výnos ETF investic (p.a.)',
    shortName: 'Roční výnos (p.a.)',
    category: 'Investiční parametr',
    summary: 'Průměrné roční procentuální zhodnocení portfolia po odečtení poplatků (p.a. = per annum, ročně).',
    details: 'Na spořicím účtu dosáhnete 2–4 %, v konzervativních dluhopisech 4–5 %, v globálních ETF 7 % a v americkém indexu S&P 500 historicky 8–10 % p.a. Každé procento navíc má díky složenému úročení obrovský vliv.',
    example: 'Rozdíl mezi 5 % a 8,5 % ročně může na 10letém horizontu znamenat stovky tisíc až miliony korun čistého zisku navíc.',
    tip: 'Akciové trhy v jednotlivých letech kolísají, ale v horizontu 10+ let je průměrný výnos širokých indexů překvapivě stabilní.',
  },
  etfStrategies: {
    id: 'etfStrategies',
    title: 'Strategie ETF fondů (Přednastavené profily)',
    shortName: 'ETF Strategie',
    category: 'Investiční nástroje',
    summary: 'Možnosti zhodnocení od konzervativního mixu (5 %) po růstové technologické indexy (11 %).',
    details: 'Indexové ETF fondy nakupují stovky až tisíce největších světových společností najednou s minimálními poplatky (typicky 0,05–0,2 % ročně). Jsou základním stavebním kamenem Smart Life.',
    example: 'S&P 500 zahrnuje 500 nejvýznamnějších firem USA, MSCI World více než 1 500 firem z 23 rozvinutých zemí.',
    tip: 'Pro začátečníky je ideální volbou globální ETF (MSCI World) nebo americký S&P 500 v akumulační verzi (Acc) s automatickým reinvestováním dividend.',
  },
  timeSaved: {
    id: 'timeSaved',
    title: 'Zkrácení cesty k finanční nezávislosti',
    shortName: 'Ušetřené roky',
    category: 'Přínos strategie',
    summary: 'Kolik let a měsíců života ušetříte díky vyššímu zhodnocení ETF fondů ve srovnání s konzervativní strategií (5 % p.a.).',
    details: 'Ukazuje přímou hodnotu investování do kvalitních ETF. Nevyděláváte jen virtuální peníze v aplikaci – získáváte reálné roky volného času, které byste jinak museli strávit v práci.',
    formula: 'Ušetřený čas = Doba při konzervativním výnosu (5 %) - Doba při vašem zvoleném výnosu',
    example: 'Ušetříte 6 let a 4 měsíce – to je přes 6 let svobodného života bez nutnosti pracovat pro obživu.',
    tip: 'Peníze se dají vydělat znovu, čas ne. Rychlejší cesta k nezávislosti vám vrací vaše nejcennější aktivum – čas.',
  },
  extraGains: {
    id: 'extraGains',
    title: 'Navýšení zisku za 10 let',
    shortName: 'Zisk navíc z ETF',
    category: 'Složené úročení',
    summary: 'Čistý finanční zisk navíc, který vám vygeneruje vyšší zhodnocení oproti konzervativnímu spoření, při stejném vkladu.',
    details: 'Rozdíl mezi výsledným kapitálem při vašem zadaném zhodnocení a kapitálem při konzervativním 5% výnosu. Peníze vznikají tím, že dřívější zisky samy plodí další zisky.',
    example: 'Při vkladu 5 000 Kč/měsíc přinese výnos 8,5 % p.a. oproti 5 % p.a. více než 200 000 Kč čistého zisku navíc.',
    tip: 'Tyto peníze navíc nevyžadují žádnou práci přesčas – pracují pro vás peníze samy.',
  },
  monthlyInvestment: {
    id: 'monthlyInvestment',
    title: 'Měsíční investice do FFA (Džbán svobody)',
    shortName: 'Měsíční vklad',
    category: 'Pravidelný vklad',
    summary: 'Částka, kterou každý měsíc pravidelně odesíláte ze své výplaty do investičních ETF fondů.',
    details: 'Metoda Sedmi džbánů doporučuje minimálně 10 % z čistého měsíčního příjmu (Financial Freedom Account - FFA). Zásadou je „zaplať nejdříve sobě samému“ – trvalý příkaz hned den po výplatě.',
    example: 'Při příjmu 45 000 Kč je základní doporučený vklad 10 % = 4 500 Kč měsíčně.',
    tip: 'Pravidelnost a automatizace je důležitější než pokusy o časování trhu. I malá částka posílaná každý měsíc vytvoří za 10 let obrovský majetek.',
  },
  targetMonthlyPassive: {
    id: 'targetMonthlyPassive',
    title: 'Cílový pasivní příjem (Životní náklady)',
    shortName: 'Cílové měsíční náklady',
    category: 'Cílový rozpočet',
    summary: 'Výše měsíční renty, kterou potřebujete pro pokrytí svého života bez nutnosti pracovat.',
    details: 'Představuje vaše měsíční výdaje v dnešních cenách. Můžete zvolit buď základní nutnosti (Džbán nutností, cca 50 % příjmu), nebo kompletní rozpočet včetně zábavy.',
    example: 'Při 25 000 Kč měsíčně vám pasivní příjem zaplatí bydlení, jídlo i běžné účty.',
    tip: 'Čím skromnější jsou vaše nutné výdaje, tím dříve jste finančně svobodní. Zbytečné spotřební dluhy cíl oddalují.',
  },
  safeWithdrawalRate: {
    id: 'safeWithdrawalRate',
    title: 'Pravidlo bezpečného výběru (Pravidlo 4 % / SWR)',
    shortName: 'Pravidlo 4 %',
    category: 'Pravidlo čerpání',
    summary: 'Maximální procento portfolia, které můžete ročně utratit, aby vám kapitál nikdy nedošel.',
    details: 'Vychází z historické studie Trinity Study. Široký akciový trh dlouhodobě roste o 7–10 % p.a. Pokud vyberete 4 %, zbývající procenta pokryjí inflaci i propady trhů.',
    formula: 'Roční výběr = 4 % z celkového portfolia (tj. Portfolio ÷ 25)',
    example: 'Z portfolia 10 000 000 Kč je bezpečný roční výběr 400 000 Kč (cca 33 333 Kč měsíčně).',
    tip: 'V krizových letech, kdy trhy klesají, je dobré výběry mírně omezit a využít nouzovou rezervu.',
  },
  autoSync: {
    id: 'autoSync',
    title: 'Propojení se džbánem Svoboda (Auto-Sync)',
    shortName: 'Propojení s rozpočtem',
    category: 'Nastavení modelu',
    summary: 'Automatické načítání skutečných zůstatků a příjmu z vašeho rozpočtu v aplikaci.',
    details: 'Když je zapnuto, kalkulačka automaticky pracuje s vaším reálným zůstatkem ve Džbánu svobody, nastaveným procentem a příjmem. Po vypnutí můžete zkoušet libovolné hypotetické částky.',
    tip: 'Nechte zapnuté pro plánování reality, vypněte, pokud chcete otestovat scénář „co kdybych vydělával víc“.',
  },
  milestoneLean: {
    id: 'milestoneLean',
    title: '1. Milník: Základní svoboda (Lean FI - 33 %)',
    shortName: '1. Milník (Lean FI)',
    category: 'Milník nezávislosti',
    summary: 'Fáze, kdy pasivní příjem pokrývá první třetinu (33 %) vašich životních nákladů.',
    details: 'Tento milník vám pokryje např. jídlo, energie a základní účty. Přináší obrovskou psychickou úlevu – víte, že jste přečkali nejistotu a systém spolehlivě funguje.',
    example: 'Při cíli 25 000 Kč/měs máte pasivní příjem cca 8 250 Kč/měs.',
    tip: 'Oslavte tento milník! Pokoření první třetiny bývá nejtěžší, odsud už složené úročení začíná výrazně pomáhat.',
  },
  milestoneBarista: {
    id: 'milestoneBarista',
    title: '2. Milník: Poloviční svoboda (Barista FI - 66 %)',
    shortName: '2. Milník (Barista FI)',
    category: 'Milník nezávislosti',
    summary: 'Fáze, kdy pasivní příjem hradí dvě třetiny (66 %) vašich výdajů.',
    details: 'Nazývá se „Barista FI“, protože k životu vám stačí libovolná pohodová brigáda nebo poloviční úvazek. Už nemusíte snášet toxické šéfy ani pracovat přesčas.',
    example: 'Pasivní příjem 16 500 Kč/měs z potřebných 25 000 Kč/měs.',
    tip: 'Zde mnoho lidí volí flexibilnější životní styl, zkrácený pracovní týden nebo začíná podnikat bez existenčního strachu.',
  },
  milestoneFire: {
    id: 'milestoneFire',
    title: '3. Milník: Úplná finanční nezávislost (FIRE - 100 %)',
    shortName: '3. Milník (FIRE)',
    category: 'Milník nezávislosti',
    summary: 'Dosažení 100% finanční nezávislosti. Pasivní příjem plně hradí veškeré životní náklady.',
    details: 'FIRE (Financial Independence, Retire Early). Práce je od této chvíle čistě dobrovolná volba. Vaše peníze pracují za vás.',
    example: 'Pasivní příjem celých 25 000 Kč/měs z investičního kapitálu 7 500 000 Kč.',
    tip: 'Gratulujeme, jste svobodný člověk. Můžete se věnovat rodině, tvorbě, filantropii nebo projektům, které vás naplňují.',
  },
  chartCompounding: {
    id: 'chartCompounding',
    title: 'Křivka složeného úročení a růstu majetku',
    shortName: 'Křivka složeného úročení',
    category: 'Grafický model',
    summary: 'Vizuální porovnání vašich vlastních vkladů (zlatá plocha) a čistého zisku z ETF (zelená plocha).',
    details: 'Zlatá plocha ukazuje, kolik korun jste sami poslali ze své výplaty. Zelená plocha ukazuje peníze, které pro vás vydělal trh. Sledujte, jak se po 5. roce křivka zvedá nahoru – to je síla exponenciály.',
    tip: 'Na interaktivním grafu můžete najet myší (nebo klepnout prstem) na jednotlivé roky a zobrazit podrobný rozpad stavu.',
  },
};

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
  const [viewMode, setViewMode] = useState<'guide' | 'simulator' | 'glossary'>('guide');
  const [activeExplanationId, setActiveExplanationId] = useState<string | null>(null);
  const [glossarySearch, setGlossarySearch] = useState('');

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

        {/* View Mode Switcher: Návod vs. Simulátor vs. Slovníček */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/5 bg-[#141416] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="tab-fi-guide"
              onClick={() => setViewMode('guide')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'guide'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Návod v lidské řeči</span>
            </button>

            <button
              type="button"
              id="tab-fi-simulator"
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'simulator'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kalkulačka & graf</span>
            </button>

            <button
              type="button"
              id="tab-fi-glossary"
              onClick={() => setViewMode('glossary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'glossary'
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Slovníček ukazatelů ({Object.keys(METRIC_EXPLANATIONS).length})</span>
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
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                      Číslo finanční svobody
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('fiNumber')}
                      className="p-1 -mr-1 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Co znamená Číslo finanční svobody?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-[#d4af37] tabular-nums">
                    {formatCZK(financialIndependenceTarget)}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">
                    25× roční výdaje ({formatCZK(targetMonthlyPassive)}/měs)
                  </p>
                </div>

                {/* KPI 2: Pasivní příjem za 10 let */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                      Pasivní příjem za {simulationYears} let
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('passiveIncome10y')}
                      className="p-1 -mr-1 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Co znamená Pasivní příjem za 10 let?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                    {formatCZK(finalYearData.monthlyPassiveIncome)} / měs
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">
                    Při 4% bezpečném výběru
                  </p>
                </div>

                {/* KPI 3: Celkový majetek za 10 let */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                      Naspořeno a zhodnoceno
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('totalBalance10y')}
                      className="p-1 -mr-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Co znamená Naspořeno a zhodnoceno?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {formatCZK(finalYearData.totalBalance)}
                  </p>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    Z toho zisk: +{formatCZK(finalYearData.compoundInterest)}
                  </p>
                </div>

                {/* KPI 4: Doba do cíle při tomto zhodnocení */}
                <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest truncate">
                      Čas do dosažení cíle
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('timeToTarget')}
                      className="p-1 -mr-1 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Co znamená Čas do dosažení cíle?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        <span>Modelování zhodnocení ETF fondů a zkrácení cesty</span>
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('annualReturnRate')}
                          className="p-1 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Co znamená roční výnos ETF fondů?"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      Přednastavené strategie ETF fondů (klikněte pro vyzkoušení):
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('etfStrategies')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#d4af37] hover:underline cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Jak vybrat strategii?</span>
                    </button>
                  </div>
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
                  <div className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
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
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('timeToTarget')}
                      className="p-1 text-white/30 hover:text-white"
                      title="Nápověda"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stat 2 */}
                  <div className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
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
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('timeSaved')}
                      className="p-1 text-white/30 hover:text-[#d4af37]"
                      title="Nápověda"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stat 3 */}
                  <div className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors">
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
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('extraGains')}
                      className="p-1 text-white/30 hover:text-emerald-400"
                      title="Nápověda"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Chart & Projections */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161618] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Křivka složeného úročení a růstu majetku (10 let)</span>
                      <button
                        type="button"
                        onClick={() => setActiveExplanationId('chartCompounding')}
                        className="p-1 text-[#d4af37]/80 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors cursor-pointer"
                        title="Co ukazuje křivka složeného úročení?"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
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
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Nastavení výše vkladů a životních nákladů</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-toggle-auto-sync"
                      onClick={handleToggleAutoSync}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        useAutoSync
                          ? 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30'
                          : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>{useAutoSync ? '✓ Propojeno se džbánem Svoboda' : 'Vlastní simulace (odpojeno)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveExplanationId('autoSync')}
                      className="p-1 text-white/40 hover:text-[#d4af37] rounded-lg transition-colors cursor-pointer"
                      title="Co znamená propojení se džbány?"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Input: Měsíční investice */}
                  <div className="p-3 bg-[#121214] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1">
                        <label className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                          Měsíční investice do FFA
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('monthlyInvestment')}
                          className="p-0.5 text-[#d4af37]/70 hover:text-[#d4af37] rounded transition-colors cursor-pointer"
                          title="Nápověda k měsíční investici"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </div>
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
                      className="w-full accent-[#d4af37] cursor-pointer mt-1"
                    />
                    <div className="flex justify-between items-center text-[10px] text-white/40 mt-1">
                      <span>{useAutoSync ? `Automaticky ${freedomJar?.percentage || 10} % z příjmu ${formatCZK(monthlyIncome)}` : 'Ručně nastavená částka'}</span>
                      <button
                        type="button"
                        onClick={() => setActiveExplanationId('monthlyInvestment')}
                        className="text-[#d4af37] hover:underline cursor-pointer"
                      >
                        Jak se počítá?
                      </button>
                    </div>
                  </div>

                  {/* Input: Cílový měsíční pasivní příjem */}
                  <div className="p-3 bg-[#121214] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1">
                        <label className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                          Cílový pasivní příjem
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('targetMonthlyPassive')}
                          className="p-0.5 text-[#d4af37]/70 hover:text-[#d4af37] rounded transition-colors cursor-pointer"
                          title="Nápověda k cílovému příjmu"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </div>
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
                      className="w-full accent-[#d4af37] cursor-pointer mt-1"
                    />
                    <div className="flex justify-between items-center text-[10px] text-white/40 mt-1">
                      <span className="truncate">Částka pro život bez práce</span>
                      <button
                        type="button"
                        onClick={() => setActiveExplanationId('targetMonthlyPassive')}
                        className="text-[#d4af37] hover:underline cursor-pointer shrink-0"
                      >
                        Doporučení Smart Life
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Freedom Milestones (Smart Life Methodology) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#d4af37]" />
                    <span>Milníky finanční nezávislosti (Smart Life)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveExplanationId('milestoneLean')}
                    className="inline-flex items-center gap-1 text-xs text-[#d4af37] hover:underline cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Proč 3 milníky?</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Milestone 1 */}
                  <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2 hover:border-white/15 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1">
                        1. Základní svoboda (Lean)
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('milestoneLean')}
                          className="text-[#d4af37]/70 hover:text-[#d4af37] cursor-pointer"
                          title="Vysvětlení milníku"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
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
                  <div className="p-4 rounded-xl bg-[#161618] border border-white/5 space-y-2 hover:border-white/15 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        2. Poloviční svoboda (Barista)
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('milestoneBarista')}
                          className="text-emerald-400/70 hover:text-emerald-400 cursor-pointer"
                          title="Vysvětlení milníku"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
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
                  <div className="p-4 rounded-xl bg-[#161618] border border-[#d4af37]/30 bg-gradient-to-br from-[#161618] to-[#1a1813] space-y-2 hover:border-[#d4af37]/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                        3. Úplná nezávislost (FIRE)
                        <button
                          type="button"
                          onClick={() => setActiveExplanationId('milestoneFire')}
                          className="text-[#d4af37] hover:brightness-125 cursor-pointer"
                          title="Vysvětlení milníku"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
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

          {/* VIEW MODE 3: SLOVNÍČEK VŠECH UKAZATELŮ A NÁPOVĚDA */}
          {viewMode === 'glossary' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#161618] to-[#121214] border border-blue-500/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  Kompletní přehled pojmů
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Slovníček všech ukazatelů finanční nezávislosti
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Zde najdete podrobné vysvětlení každé metriky, vzorce a pravidla, které aplikace používá. Kliknutím na libovolný ukazatel otevřete jeho detailní výklad s příklady a tipy.
                </p>
              </div>

              {/* Search Bar in Glossary */}
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Hledat v ukazatelích (např. Číslo svobody, pravidlo 4 %, ETF, zisk, milník...)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#161618] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#d4af37]/60 focus:outline-none transition-colors"
                />
              </div>

              {/* Glossary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.values(METRIC_EXPLANATIONS)
                  .filter((m) => {
                    if (!glossarySearch.trim()) return true;
                    const q = glossarySearch.toLowerCase();
                    return (
                      m.title.toLowerCase().includes(q) ||
                      m.summary.toLowerCase().includes(q) ||
                      m.details.toLowerCase().includes(q) ||
                      m.category.toLowerCase().includes(q)
                    );
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveExplanationId(item.id)}
                      className="p-4 rounded-xl bg-[#161618] border border-white/10 hover:border-[#d4af37]/40 transition-all space-y-2.5 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#d4af37] border border-white/10">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-[#d4af37] transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <span className="px-2 py-1 text-[11px] font-semibold text-[#d4af37] bg-[#d4af37]/10 group-hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-lg transition-colors shrink-0">
                          Detail →
                        </span>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">
                        {item.summary}
                      </p>

                      {item.formula && (
                        <div className="p-2 bg-[#0d0d0f] rounded-lg border border-white/5 text-[11px] font-mono text-emerald-400">
                          {item.formula}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
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

        {/* Active Metric Explanation Modal/Overlay Popover */}
        {activeExplanationId && METRIC_EXPLANATIONS[activeExplanationId] && (() => {
          const exp = METRIC_EXPLANATIONS[activeExplanationId];
          return (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
              onClick={() => setActiveExplanationId(null)}
            >
              <div
                className="relative w-full max-w-lg bg-[#141417] rounded-2xl border border-[#d4af37]/40 shadow-2xl p-5 sm:p-6 space-y-4 text-[#e5e5e7] max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                      {exp.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#d4af37]" />
                      {exp.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveExplanationId(null)}
                    className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/90 font-medium leading-relaxed">
                  {exp.summary}
                </div>

                <div className="space-y-1.5 text-xs text-white/70 leading-relaxed">
                  <strong className="text-white block">Podrobné vysvětlení:</strong>
                  <p>{exp.details}</p>
                </div>

                {exp.formula && (
                  <div className="p-3 rounded-xl bg-[#0d0d0f] border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-white/40 block">
                      Matematický vzorec:
                    </span>
                    <p className="text-xs font-mono text-emerald-400">
                      {exp.formula}
                    </p>
                  </div>
                )}

                {exp.example && (
                  <div className="p-3 rounded-xl bg-[#0d0d0f] border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-white/40 block">
                      Příklad v praxi:
                    </span>
                    <p className="text-xs text-white/70">
                      {exp.example}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-start gap-2.5 text-xs text-[#d4af37]">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Doporučení Smart Life:</strong>
                    <span className="text-white/80">{exp.tip}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveExplanationId(null)}
                    className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0a0a0b] text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    Rozumím, pokračovat
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
