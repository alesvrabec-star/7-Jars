import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Market benchmarks context
const MARKET_BENCHMARKS = {
  sp500: { name: 'S&P 500 (USA)', ytdReturn: '+22.4 %', peRatio: '26.8', trend: 'Rostoucí trend podpořený technologickým sektorem' },
  msciWorld: { name: 'MSCI World (Globální)', ytdReturn: '+17.8 %', peRatio: '20.5', trend: 'Stabilní globální růst se sníženou volatilitou' },
  nasdaq100: { name: 'Nasdaq 100 (Technologie)', ytdReturn: '+24.1 %', peRatio: '31.2', trend: 'Dynamický růst, vyšší volatilita' },
  czechInflation: { name: 'Česká inflace (Meziroční)', rate: '2.6 %', trend: 'V tolerančním pásmu ČNB (1–3 %)' },
  cnbRepoRate: { name: 'Základní sazba ČNB (2T repo)', rate: '4.0 %', trend: 'Pozvolné snižování z historických maxim' },
};

// API endpoint for Smart Life Financial Coach Evaluation
app.post('/api/coach-audit', async (req, res) => {
  try {
    const { jars, monthlyIncome, transactions, currentMonthName } = req.body;

    const freedomJar = jars?.find((j: any) => j.id === 'freedom');
    const emergencyJar = jars?.find((j: any) => j.id === 'emergency');
    const necessitiesJar = jars?.find((j: any) => j.id === 'necessities');
    const playJar = jars?.find((j: any) => j.id === 'play');

    const totalIncome = monthlyIncome || 45000;
    const freedomBalance = freedomJar?.balance || 0;
    const emergencyBalance = emergencyJar?.balance || 0;
    const necessitiesBalance = necessitiesJar?.balance || 0;
    const monthlyNecessities = Math.round((totalIncome * (necessitiesJar?.percentage || 50)) / 100);

    // Emergency buffer in months
    const emergencyMonths = monthlyNecessities > 0 ? (emergencyBalance / monthlyNecessities).toFixed(1) : '0';

    // Total expenses recorded this month
    const expenseTransactions = (transactions || []).filter((t: any) => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

    // Prompt for Gemini AI Coach
    const prompt = `Jsi osobní finanční kouč podle metody Sedmi džbánů a filozofie Smart Life (Tomáše Pieružka z smart-life.sk).
Tvým cílem je vést uživatele jasně, srozumitelně a lidsky k finanční nezávislosti do 10 let.
Mluv přátelsky, přímo a v češtině ("tykej"). Vyhni se složitému bankovnímu žargonu.

Zde jsou reálná data uživatele:
- Měsíční čistý příjem: ${totalIncome.toLocaleString('cs-CZ')} Kč
- Měsíc hodnocení: ${currentMonthName || 'Aktuální měsíc'}
- Džbán finanční svobody (investice do ETF): ${freedomBalance.toLocaleString('cs-CZ')} Kč (příděl ${freedomJar?.percentage || 10} % = ${Math.round((totalIncome * (freedomJar?.percentage || 10)) / 100).toLocaleString('cs-CZ')} Kč/měsíc)
- Džbán nouzové rezervy: ${emergencyBalance.toLocaleString('cs-CZ')} Kč (pokrývá cca ${emergencyMonths} měsíců nutných výdajů)
- Džbán nutností: ${necessitiesBalance.toLocaleString('cs-CZ')} Kč (rozpočet: ${necessitiesJar?.percentage || 50} %)
- Džbán na radost a hry: ${playJar?.balance || 0} Kč
- Celkem zaevidované výdaje: ${totalExpenses.toLocaleString('cs-CZ')} Kč

Kontext finančních trhů pro tento měsíc:
- S&P 500: YTD ${MARKET_BENCHMARKS.sp500.ytdReturn}, trend: ${MARKET_BENCHMARKS.sp500.trend}
- MSCI World: YTD ${MARKET_BENCHMARKS.msciWorld.ytdReturn}
- Česká inflace: ${MARKET_BENCHMARKS.czechInflation.rate}

Odpověz ve formátu JSON s následující strukturou:
{
  "coachScore": (číslo 1-100 vyjadřující jak dobře si uživatel vede na cestě ke svobodě),
  "statusTitle": "(krátké shrnutí v 3-6 slovech, např. 'Pevné základy a správný směr')",
  "executiveSummary": "(2-3 věty lidského shrnutí měsíce: jak hospodařil a co je nejdůležitější)",
  "threeActionSteps": [
    "(Krok 1: konkrétní instrukce, kolik Kč kam poslat hned teď)",
    "(Krok 2: konkrétní investiční pokyn do ETF a proč)",
    "(Krok 3: doporučení na výdaje nebo radost bez výčitek)"
  ],
  "marketInsight": "(1-2 věty o tom, co aktuální situace na trzích znamená pro jeho 10letý plán – zdůrazni, že krátkodobé výkyvy nevadí a pravidelné nákupy ETF vyhrávají)",
  "freedomOutlook": "(1 věta odhadující postup k finanční nezávislosti a pochvala za disciplínu)"
}`;

    // Call Gemini if API Key is available (with timeout protection)
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({});
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini call timed out')), 4500)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            ...parsed,
            marketBenchmarks: MARKET_BENCHMARKS,
            isAiGenerated: true,
          });
        }
      } catch (aiErr) {
        console.warn('Gemini API call timed out or failed, falling back to rule-based coach logic:', aiErr);
      }
    }

    // High quality deterministic rule-based coach logic (Smart Life & 7 Jars)
    const isReserveHealthy = parseFloat(emergencyMonths) >= 3;
    const monthlyFreedomAllocation = Math.round((totalIncome * (freedomJar?.percentage || 10)) / 100);
    const freedomYearsEquivalent = monthlyNecessities > 0 ? (freedomBalance / (monthlyNecessities * 12)).toFixed(1) : '0';

    let coachScore = 75;
    let statusTitle = 'Skvělý rozjezd k nezávislosti';
    let executiveSummary = `Tento měsíc máš čistý příjem ${totalIncome.toLocaleString('cs-CZ')} Kč. Z toho ${freedomJar?.percentage || 10} % (${monthlyFreedomAllocation.toLocaleString('cs-CZ')} Kč) systematicky směřuje do tvé finanční svobody.`;
    const actionSteps: string[] = [];

    if (!isReserveHealthy) {
      coachScore = 65;
      statusTitle = 'Priorita č. 1: Zpevnit nouzovou rezervu';
      executiveSummary += ` Nouzový polštář zatím pokrývá ${emergencyMonths} měsíců výdajů. Pro klidné spaní a ochranu investic potřebujeme mít na spořicím účtu alespoň 3 měsíce.`;
      actionSteps.push(`Doplň do Džbánu rezervy částku alespoň ${Math.round(monthlyNecessities * 0.5).toLocaleString('cs-CZ')} Kč, abys dosáhl bezpečných 3 měsíců výdajů.`);
      actionSteps.push(`Do Džbánu svobody pošli plánovaných ${monthlyFreedomAllocation.toLocaleString('cs-CZ')} Kč a nakup široké ETF (např. S&P 500 nebo MSCI World). Tyto peníze nikdy neutrácíš.`);
      actionSteps.push(`Hlídej výdaje v Džbánu nutností, aby nepřekročily 50 % příjmu (${monthlyNecessities.toLocaleString('cs-CZ')} Kč).`);
    } else {
      coachScore = 88;
      statusTitle = 'Vynikající finanční disciplína';
      executiveSummary += ` Tvoje nouzová rezerva je zdravá (${emergencyMonths} měsíců výdajů). To ti dává plnou sílu soustředit se na exponenciální růst v Džbánu finanční svobody.`;
      actionSteps.push(`Investuj celých ${monthlyFreedomAllocation.toLocaleString('cs-CZ')} Kč ze Džbánu svobody do nízkonákladového ETF fondu.`);
      actionSteps.push(`Pokud v Džbánu nutností zbyde přebytek, převeď 50 % z něj do Džbánu svobody – zkrátíš si tím cestu k nezávislosti až o 1,5 roku.`);
      actionSteps.push(`Z Džbánu na radost bez výčitek utrať za zážitek nebo relax – udržitelné hospodaření vyžaduje i radost ze života.`);
    }

    return res.json({
      coachScore,
      statusTitle,
      executiveSummary,
      threeActionSteps: actionSteps,
      marketInsight: `Globální trhy (MSCI World ${MARKET_BENCHMARKS.msciWorld.ytdReturn}) i S&P 500 (${MARKET_BENCHMARKS.sp500.ytdReturn}) letos rostou. Drž se měsíčního pravidelného nákupu bez ohledu na zprávy v médiích – čas na trhu vždy poráží časování trhu.`,
      freedomOutlook: `Při stávajícím tempu si systematicky buduješ pasivní příjem, který ti zajistí svobodu volby bez závislosti na zaměstnavateli.`,
      marketBenchmarks: MARKET_BENCHMARKS,
      isAiGenerated: false,
    });
  } catch (error: any) {
    console.error('Error in coach-audit endpoint:', error);
    res.status(500).json({ error: 'Chyba při vyhodnocení finančního kouče' });
  }
});

// Setup Vite in development or static serve in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial applet running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
