/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Jar, JarId, Transaction, TransactionType, RecurringExpense } from './types';
import { DEFAULT_JARS, SAMPLE_TRANSACTIONS } from './data/defaultJars';
import { DEFAULT_RECURRING_EXPENSES } from './data/defaultRecurringExpenses';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { JarCard } from './components/JarCard';
import { IncomeDistributorModal } from './components/IncomeDistributorModal';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { JarDetailModal } from './components/JarDetailModal';
import { MethodGuideModal } from './components/MethodGuideModal';
import { TransactionHistory } from './components/TransactionHistory';
import { AuthModal } from './components/AuthModal';
import { RecurringExpensesModal } from './components/RecurringExpensesModal';
import { useAuth } from './context/AuthContext';
import {
  initializeUserCloudData,
  saveJarsToCloud,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  saveMonthlyIncomeToCloud,
  saveRecurringExpensesToCloud,
  subscribeToUserCloudData,
} from './services/firestoreSync';
import { Cloud, ArrowRight, Repeat } from 'lucide-react';

const STORAGE_KEYS = {
  JARS: 'seven_jars_data_v1',
  TRANSACTIONS: 'seven_jars_transactions_v1',
  INCOME: 'seven_jars_monthly_income_v1',
  RECURRING: 'seven_jars_recurring_v1',
};

export default function App() {
  const { user } = useAuth();

  // State for Jars
  const [jars, setJars] = useState<Jar[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JARS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_JARS;
  });

  // State for monthly planned income
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOME);
      if (saved) return Number(saved);
    } catch {
      // fallback
    }
    return 45000;
  });

  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return SAMPLE_TRANSACTIONS;
  });

  // State for recurring expenses / standing orders
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_RECURRING_EXPENSES;
  });

  // Cloud sync & modal states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'deposit'>('expense');
  const [selectedJarForTx, setSelectedJarForTx] = useState<JarId | undefined>(undefined);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSourceJarId, setTransferSourceJarId] = useState<JarId | undefined>(undefined);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [detailJar, setDetailJar] = useState<Jar | null>(null);

  // Firestore Real-Time Synchronization
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setIsSyncing(true);

    async function syncWithCloud() {
      if (!user) return;
      try {
        await initializeUserCloudData(
          user.uid,
          jars,
          transactions,
          monthlyIncome,
          recurringExpenses
        );
        if (!isMounted) return;

        const unsubscribe = subscribeToUserCloudData(user.uid, {
          onJarsUpdate: (cloudJars) => {
            if (cloudJars && cloudJars.length === 7) {
              setJars(cloudJars);
            }
          },
          onTransactionsUpdate: (cloudTxs) => {
            setTransactions(cloudTxs);
          },
          onIncomeUpdate: (cloudIncome) => {
            setMonthlyIncome(cloudIncome);
          },
          onRecurringExpensesUpdate: (cloudExpenses) => {
            if (cloudExpenses && cloudExpenses.length > 0) {
              setRecurringExpenses(cloudExpenses);
            }
          },
        });

        setIsSyncing(false);
        return unsubscribe;
      } catch (err) {
        console.error('Cloud synchronization error:', err);
        setIsSyncing(false);
      }
    }

    const unsubPromise = syncWithCloud();

    return () => {
      isMounted = false;
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, [user?.uid]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(jars));
  }, [jars]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOME, String(monthlyIncome));
  }, [monthlyIncome]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  // Keep detail jar synced if jars change
  useEffect(() => {
    if (detailJar) {
      const updated = jars.find((j) => j.id === detailJar.id);
      if (updated) setDetailJar(updated);
    }
  }, [jars]);

  // Actions
  const handleDepositQuick = (jarId: JarId) => {
    setSelectedJarForTx(jarId);
    setTransactionType('deposit');
    setIsTransactionOpen(true);
  };

  const handleExpenseQuick = (jarId: JarId) => {
    setSelectedJarForTx(jarId);
    setTransactionType('expense');
    setIsTransactionOpen(true);
  };

  const handleTransferQuick = (jarId: JarId) => {
    setTransferSourceJarId(jarId);
    setIsTransferOpen(true);
  };

  const handleDistribute = async (totalAmount: number, updatedPercentages: Record<JarId, number>) => {
    setMonthlyIncome(totalAmount);

    // Update jar balances and percentages
    const updatedJars = jars.map((jar) => {
      const pct = updatedPercentages[jar.id] ?? jar.percentage;
      const share = Math.round((totalAmount * pct) / 100);
      return {
        ...jar,
        percentage: pct,
        balance: jar.balance + share,
      };
    });

    setJars(updatedJars);

    // Record transaction
    const now = new Date();
    const newTx: Transaction = {
      id: `distribute-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      timestamp: Date.now(),
      amount: totalAmount,
      type: 'income_distribution',
      jarId: 'necessities', // primary jar label for the overall event
      note: `Měsíční příděl rozdělen podle poměrů metody 7 džbánů`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          saveTransactionToCloud(user.uid, newTx),
          saveMonthlyIncomeToCloud(user.uid, totalAmount),
        ]);
      } catch (err) {
        console.error('Error saving distribute to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleAddTransaction = async (data: {
    type: TransactionType;
    jarId: JarId;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => {
    // Update jar balance
    const updatedJars = jars.map((j) => {
      if (j.id === data.jarId) {
        const delta = data.type === 'expense' ? -data.amount : data.amount;
        return {
          ...j,
          balance: j.balance + delta,
        };
      }
      return j;
    });

    setJars(updatedJars);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: data.date,
      timestamp: Date.now(),
      amount: data.amount,
      type: data.type,
      jarId: data.jarId,
      category: data.category,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          saveTransactionToCloud(user.uid, newTx),
        ]);
      } catch (err) {
        console.error('Error saving transaction to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleTransfer = async (data: {
    fromJarId: JarId;
    toJarId: JarId;
    amount: number;
    note: string;
    date: string;
  }) => {
    const updatedJars = jars.map((j) => {
      if (j.id === data.fromJarId) {
        return { ...j, balance: j.balance - data.amount };
      }
      if (j.id === data.toJarId) {
        return { ...j, balance: j.balance + data.amount };
      }
      return j;
    });

    setJars(updatedJars);

    const newTx: Transaction = {
      id: `tr-${Date.now()}`,
      date: data.date,
      timestamp: Date.now(),
      amount: data.amount,
      type: 'transfer',
      jarId: data.fromJarId,
      toJarId: data.toJarId,
      note: data.note,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          saveTransactionToCloud(user.uid, newTx),
        ]);
      } catch (err) {
        console.error('Error saving transfer to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert balance change if possible
    let updatedJars = jars;
    if (tx.type === 'expense') {
      updatedJars = jars.map((j) =>
        j.id === tx.jarId ? { ...j, balance: j.balance + tx.amount } : j
      );
    } else if (tx.type === 'manual_deposit') {
      updatedJars = jars.map((j) =>
        j.id === tx.jarId ? { ...j, balance: j.balance - tx.amount } : j
      );
    } else if (tx.type === 'transfer' && tx.toJarId) {
      updatedJars = jars.map((j) => {
        if (j.id === tx.jarId) return { ...j, balance: j.balance + tx.amount };
        if (j.id === tx.toJarId) return { ...j, balance: j.balance - tx.amount };
        return j;
      });
    }

    setJars(updatedJars);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          deleteTransactionFromCloud(user.uid, id),
        ]);
      } catch (err) {
        console.error('Error deleting transaction from cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Recurring Expenses Handlers
  const handleSaveRecurringExpenses = async (updated: RecurringExpense[]) => {
    setRecurringExpenses(updated);
    if (user) {
      setIsSyncing(true);
      try {
        await saveRecurringExpensesToCloud(user.uid, updated);
      } catch (err) {
        console.error('Error saving recurring expenses to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleExecuteRecurringExpenses = async (
    selected: RecurringExpense[],
    date: string,
    targetMonth: string
  ) => {
    const timestamp = Date.now();
    const newTransactions: Transaction[] = selected.map((exp, idx) => ({
      id: `tx-rec-${timestamp}-${idx}`,
      date: date,
      timestamp: timestamp + idx,
      amount: exp.amount,
      type: 'expense',
      jarId: exp.jarId,
      category: exp.category || 'Trvalý příkaz',
      note: `Trvalý příkaz: ${exp.name}`,
      isRecurring: true,
    }));

    // Deduct balances from respective jars
    const updatedJars = jars.map((jar) => {
      const totalDeducted = selected
        .filter((e) => e.jarId === jar.id)
        .reduce((sum, e) => sum + e.amount, 0);
      if (totalDeducted > 0) {
        return { ...jar, balance: jar.balance - totalDeducted };
      }
      return jar;
    });

    // Update lastExecutedMonth on the recurring items
    const updatedRecurring = recurringExpenses.map((exp) => {
      if (selected.some((s) => s.id === exp.id)) {
        return { ...exp, lastExecutedMonth: targetMonth, updatedAt: new Date().toISOString() };
      }
      return exp;
    });

    setJars(updatedJars);
    setTransactions((prev) => [...newTransactions, ...prev]);
    setRecurringExpenses(updatedRecurring);

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          ...newTransactions.map((tx) => saveTransactionToCloud(user.uid, tx)),
          saveRecurringExpensesToCloud(user.uid, updatedRecurring),
        ]);
      } catch (err) {
        console.error('Error syncing executed recurring expenses to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Export & Import
  const handleExportJSON = () => {
    const data = {
      version: 2,
      exportDate: new Date().toISOString(),
      monthlyIncome,
      jars,
      transactions,
      recurringExpenses,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sedm-dzbanu-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Datum', 'Typ', 'Džbán', 'Kategorie', 'Částka (Kč)', 'Poznámka'];
    const rows = transactions.map((t) => {
      const jar = jars.find((j) => j.id === t.jarId);
      return [
        t.date,
        t.type,
        jar ? jar.shortName : t.jarId,
        t.category || '',
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sedm-dzbanu-transakce-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.jars)) {
          setJars(parsed.jars);
          if (user) {
            await saveJarsToCloud(user.uid, parsed.jars);
          }
        }
        if (Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
        }
        if (typeof parsed.monthlyIncome === 'number') {
          setMonthlyIncome(parsed.monthlyIncome);
          if (user) {
            await saveMonthlyIncomeToCloud(user.uid, parsed.monthlyIncome);
          }
        }
        if (Array.isArray(parsed.recurringExpenses)) {
          setRecurringExpenses(parsed.recurringExpenses);
          if (user) {
            await saveRecurringExpensesToCloud(user.uid, parsed.recurringExpenses);
          }
        }
      } catch (err) {
        console.error('Neplatný formát souboru:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSampleData = async () => {
    if (window.confirm('Opravdu si přejete obnovit výchozí ukázková data?')) {
      setJars(DEFAULT_JARS);
      setTransactions(SAMPLE_TRANSACTIONS);
      setMonthlyIncome(45000);
      setRecurringExpenses(DEFAULT_RECURRING_EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.JARS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.INCOME);
      localStorage.removeItem(STORAGE_KEYS.RECURRING);

      if (user) {
        setIsSyncing(true);
        await saveJarsToCloud(user.uid, DEFAULT_JARS);
        await saveMonthlyIncomeToCloud(user.uid, 45000);
        await saveRecurringExpensesToCloud(user.uid, DEFAULT_RECURRING_EXPENSES);
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e5e7] flex flex-col selection:bg-[#d4af37]/20 selection:text-[#d4af37]">
      {/* Top Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro banner on Seven Jars */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-7 text-[#e5e5e7] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 mb-3 tracking-wide uppercase">
              Osvědčený systém rozpočtování
            </span>
            <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-white mb-2">
              Každá koruna má svůj předem určený úkol
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
              Metoda <strong className="text-white">Sedmi džbánů</strong> rozděluje váš příjem do 7 samostatných kategorií. Zajišťuje, že systematicky investujete do své finanční svobody, tvoříte nouzovou rezervu a zároveň můžete bez výčitek utrácet za radost a životní zážitky.
            </p>
          </div>
        </div>

        {/* Cloud account banner if not logged in */}
        {!user && (
          <div className="bg-gradient-to-r from-[#161618] to-[#121214] border border-[#d4af37]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Chcete spravovat své finance z jakéhokoliv zařízení?
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Přihlaste se přes Google nebo e-mail. Vaše džbány, transakce a zůstatky se automaticky a bezpečně propojí v cloudu.
                </p>
              </div>
            </div>
            <button
              id="btn-banner-login"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#d4af37]/10 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Aktivovat cloudové konto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Stats Bar */}
        <StatsBar
          jars={jars}
          monthlyIncome={monthlyIncome}
          onOpenDistribute={() => setIsDistributeOpen(true)}
          onOpenExpense={() => {
            setSelectedJarForTx('necessities');
            setTransactionType('expense');
            setIsTransactionOpen(true);
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenRecurring={() => setIsRecurringOpen(true)}
          recurringCount={recurringExpenses.filter((e) => e.active).length}
        />

        {/* 7 Jars Grid */}
        <section id="jars-grid-section">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-serif text-white tracking-tight">
                Vašich 7 finančních džbánů
              </h2>
              <p className="text-xs text-white/40 font-normal">
                Kliknutím na tlačítka můžete rychle evidovat výdaj, vklad nebo převod
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-recurring-shortcut"
                onClick={() => setIsRecurringOpen(true)}
                className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Trvalé příkazy</span>
              </button>

              <button
                id="btn-distribute-shortcut"
                onClick={() => setIsDistributeOpen(true)}
                className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 px-3.5 py-1.5 rounded-xl transition-all hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                Rozdělit příjem
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {jars.map((jar) => (
              <JarCard
                key={jar.id}
                jar={jar}
                monthlyIncome={monthlyIncome}
                onDeposit={handleDepositQuick}
                onExpense={handleExpenseQuick}
                onTransfer={handleTransferQuick}
                onShowDetail={(j) => setDetailJar(j)}
              />
            ))}
          </div>
        </section>

        {/* Transaction History & Data Management */}
        <TransactionHistory
          transactions={transactions}
          jars={jars}
          onDeleteTransaction={handleDeleteTransaction}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          onImportJSON={handleImportJSON}
          onResetSampleData={handleResetSampleData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0b] py-6 mt-12 text-center text-xs text-white/40">
        <p>
          Metoda Sedmi džbánů • Vytvořeno pro přehledné a klidné řízení osobních financí
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <IncomeDistributorModal
        isOpen={isDistributeOpen}
        onClose={() => setIsDistributeOpen(false)}
        jars={jars}
        initialIncome={monthlyIncome}
        onDistribute={handleDistribute}
      />

      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        jars={jars}
        initialType={transactionType}
        initialJarId={selectedJarForTx}
        onSubmit={handleAddTransaction}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        jars={jars}
        fromJarId={transferSourceJarId}
        onTransfer={handleTransfer}
      />

      <JarDetailModal
        jar={detailJar}
        onClose={() => setDetailJar(null)}
        transactions={transactions}
        onAddExpense={handleExpenseQuick}
        onAddDeposit={handleDepositQuick}
      />

      <MethodGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <RecurringExpensesModal
        isOpen={isRecurringOpen}
        onClose={() => setIsRecurringOpen(false)}
        jars={jars}
        recurringExpenses={recurringExpenses}
        onSaveExpenses={handleSaveRecurringExpenses}
        onExecuteExpenses={handleExecuteRecurringExpenses}
      />
    </div>
  );
}
