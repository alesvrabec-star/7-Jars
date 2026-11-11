/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Jar, JarId, Transaction, TransactionType, RecurringExpense } from './types';
import { DEFAULT_JARS, SAMPLE_TRANSACTIONS } from './data/defaultJars';
import { DEFAULT_RECURRING_EXPENSES } from './data/defaultRecurringExpenses';
import { formatCZK } from './utils/formatters';
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
import { SettingsModal } from './components/SettingsModal';
import { FinancialIndependenceModal } from './components/FinancialIndependenceModal';
import { FinancialCoachModal } from './components/FinancialCoachModal';
import { FinancialIndependenceBar } from './components/FinancialIndependenceBar';
import { InitialBalancesModal } from './components/InitialBalancesModal';
import { MobileNavDock } from './components/MobileNavDock';
import { FinancialWisdomBanner } from './components/FinancialWisdomBanner';
import { useAuth } from './context/AuthContext';
import {
  initializeUserCloudData,
  saveJarsToCloud,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  saveMonthlyIncomeToCloud,
  saveRecurringExpensesToCloud,
  deleteRecurringExpenseFromCloud,
  subscribeToUserCloudData,
} from './services/firestoreSync';
import { Cloud, ArrowRight, Repeat, RotateCcw, Calendar, X as CloseIcon, Sparkles, Sliders, TrendingUp, Compass, Coins } from 'lucide-react';

const STORAGE_KEYS = {
  JARS: 'seven_jars_data_v1',
  TRANSACTIONS: 'seven_jars_transactions_v1',
  INCOME: 'seven_jars_monthly_income_v1',
  RECURRING: 'seven_jars_recurring_v1',
  ACTIVE_MONTH: 'seven_jars_active_month_v1',
  DISMISSED_DISCREPANCY_NOTICE: 'seven_jars_dismissed_discrepancy_v1',
};

const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthCzechName = (date = new Date()) => {
  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFIOpen, setIsFIOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isInitialBalancesOpen, setIsInitialBalancesOpen] = useState(false);
  const [detailJar, setDetailJar] = useState<Jar | null>(null);

  // Month notice and discrepancy banner state
  const [monthNotice, setMonthNotice] = useState<string | null>(null);
  const [dismissedNotice, setDismissedNotice] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DISMISSED_DISCREPANCY_NOTICE) === 'true';
    } catch {
      return false;
    }
  });

  // Monthly rollover detection & automatic zero-reset
  useEffect(() => {
    const currentKey = getCurrentMonthKey();
    const savedActiveMonth = localStorage.getItem(STORAGE_KEYS.ACTIVE_MONTH);

    if (savedActiveMonth && savedActiveMonth !== currentKey) {
      // New month started! Automatic reset of all jars to 0
      const resetJars = jars.map((j) => ({ ...j, balance: 0 }));
      setJars(resetJars);
      localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(resetJars));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, currentKey);

      if (user) {
        saveJarsToCloud(user.uid, resetJars).catch(console.error);
      }

      setMonthNotice(
        `Nový měsíc (${getMonthCzechName()}): Všechny džbány byly automaticky nastaveny na 0 Kč pro začátek nového měsíce.`
      );
    } else if (!savedActiveMonth) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MONTH, currentKey);
    }
  }, [user?.uid]);

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
            if (Array.isArray(cloudExpenses)) {
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

  const handleDistribute = async (
    totalAmount: number,
    updatedPercentages: Record<JarId, number>,
    mode: 'fresh_month' | 'add_to_existing' = 'fresh_month'
  ) => {
    setMonthlyIncome(totalAmount);

    // Update jar balances and percentages
    const updatedJars = jars.map((jar) => {
      const pct = updatedPercentages[jar.id] ?? jar.percentage;
      const share = Math.round((totalAmount * pct) / 100);
      return {
        ...jar,
        percentage: pct,
        balance: mode === 'fresh_month' ? share : (jar.balance || 0) + share,
      };
    });

    setJars(updatedJars);
    setMonthNotice(null);

    // Record transaction
    const now = new Date();
    const newTx: Transaction = {
      id: `distribute-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      timestamp: Date.now(),
      amount: totalAmount,
      type: 'income_distribution',
      jarId: 'necessities', // primary jar label for the overall event
      note:
        mode === 'fresh_month'
          ? `Měsíční rozpočet ${formatCZK(totalAmount)} (nový měsíc od 0 Kč)`
          : `Přičtení měsíčního příjmu ${formatCZK(totalAmount)} ke stávajícím zůstatkům`,
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

  const handleResetJarsToZero = async () => {
    if (
      window.confirm(
        'Opravdu si přejete vynulovat všechny džbány na 0 Kč pro začátek nového měsíce?'
      )
    ) {
      const resetJars = jars.map((j) => ({ ...j, balance: 0 }));
      setJars(resetJars);
      localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(resetJars));

      const newTx: Transaction = {
        id: `reset-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        amount: 0,
        type: 'income_distribution',
        jarId: 'necessities',
        note: 'Vynulování všech džbánů na 0 Kč pro nový měsíc',
      };
      setTransactions((prev) => [newTx, ...prev]);

      if (user) {
        setIsSyncing(true);
        try {
          await Promise.all([
            saveJarsToCloud(user.uid, resetJars),
            saveTransactionToCloud(user.uid, newTx),
          ]);
        } catch (err) {
          console.error('Error resetting jars in cloud:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  const handleApplyIncomeFresh = async () => {
    const updatedJars = jars.map((jar) => {
      const share = Math.round((monthlyIncome * jar.percentage) / 100);
      return {
        ...jar,
        balance: share,
      };
    });

    setJars(updatedJars);
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(updatedJars));

    const newTx: Transaction = {
      id: `distribute-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      amount: monthlyIncome,
      type: 'income_distribution',
      jarId: 'necessities',
      note: `Nastavení měsíčního příjmu ${formatCZK(monthlyIncome)} (od 0 Kč)`,
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
        console.error('Error applying fresh income in cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
    setMonthNotice(null);
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
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(updated));
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

  const handleDeleteRecurringExpense = async (id: string) => {
    const updated = recurringExpenses.filter((e) => e.id !== id);
    setRecurringExpenses(updated);
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(updated));

    if (user) {
      setIsSyncing(true);
      try {
        await deleteRecurringExpenseFromCloud(user.uid, id);
      } catch (err) {
        console.error('Error deleting recurring expense from cloud:', err);
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

  const handleSaveJarsFromSettings = async (updatedJars: Jar[]) => {
    setJars(updatedJars);
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(updatedJars));

    if (user) {
      setIsSyncing(true);
      try {
        await saveJarsToCloud(user.uid, updatedJars);
      } catch (err) {
        console.error('Error saving updated jars to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSaveInitialBalances = async (
    updatedBalances: Record<JarId, number>,
    logTransaction: boolean,
    transactionNote?: string
  ) => {
    const previousTotal = jars.reduce((sum, j) => sum + (j.balance || 0), 0);
    const updatedJars = jars.map((j) => {
      if (updatedBalances[j.id] !== undefined) {
        return {
          ...j,
          balance: Math.max(0, updatedBalances[j.id]),
        };
      }
      return j;
    });

    const newTotal = updatedJars.reduce((sum, j) => sum + (j.balance || 0), 0);
    const delta = newTotal - previousTotal;

    setJars(updatedJars);
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(updatedJars));

    let newTx: Transaction | null = null;
    if (logTransaction) {
      const today = new Date().toISOString().split('T')[0];
      newTx = {
        id: `tx-initial-${Date.now()}`,
        date: today,
        timestamp: Date.now(),
        amount: Math.abs(delta),
        type: delta >= 0 ? 'manual_deposit' : 'expense',
        jarId: 'freedom',
        category: 'Počáteční stav',
        note:
          transactionNote ||
          `Nastavení počátečního stavu džbánů (celkem ${formatCZK(newTotal)})`,
      };
      setTransactions((prev) => [newTx!, ...prev]);
    }

    if (user) {
      setIsSyncing(true);
      try {
        await Promise.all([
          saveJarsToCloud(user.uid, updatedJars),
          newTx ? saveTransactionToCloud(user.uid, newTx) : Promise.resolve(),
        ]);
      } catch (err) {
        console.error('Error saving initial balances to cloud:', err);
      } finally {
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFinancialIndependence={() => setIsFIOpen(true)}
        onOpenCoach={() => setIsCoachOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 sm:pb-12 space-y-5 sm:space-y-7">
        {/* Dynamic Financial Wisdom & Tip */}
        <FinancialWisdomBanner />

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

        {/* Month Rollover Notification */}
        {monthNotice && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-300 shadow-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{monthNotice}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsDistributeOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-500 text-[#0a0a0b] text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                Rozdělit příjem
              </button>
              <button
                onClick={() => setMonthNotice(null)}
                className="p-1.5 text-emerald-300/60 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                title="Zavřít"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Existing Data Discrepancy Banner (e.g. When income was entered and added to demo balances) */}
        {!dismissedNotice && monthlyIncome > 0 && jars.reduce((acc, j) => acc + (j.balance || 0), 0) > 0 && Math.abs(jars.reduce((acc, j) => acc + (j.balance || 0), 0) - monthlyIncome) > 50 && (
          <div className="bg-gradient-to-r from-[#18181b] to-[#121214] border border-[#d4af37]/35 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Chcete nastavit džbány přesně podle příjmu {formatCZK(monthlyIncome)}?
                </h3>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                  Ve džbánech máte nyní celkem {formatCZK(jars.reduce((acc, j) => acc + (j.balance || 0), 0))}. Pokud jste zadali měsíční příjem a přičetl se k původním datům, můžete džbány nastavit čistě od 0 Kč.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="btn-fix-apply-fresh-income"
                onClick={handleApplyIncomeFresh}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#d4af37]/10 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rozdělit čistě {formatCZK(monthlyIncome)} (od 0 Kč)</span>
              </button>
              <button
                id="btn-fix-reset-to-zero"
                onClick={handleResetJarsToZero}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/60" />
                <span>Vynulovat na 0 Kč</span>
              </button>
              <button
                id="btn-dismiss-discrepancy"
                onClick={() => {
                  setDismissedNotice(true);
                  try {
                    localStorage.setItem(STORAGE_KEYS.DISMISSED_DISCREPANCY_NOTICE, 'true');
                  } catch {}
                }}
                className="p-2 text-white/40 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Ponechat a zavřít upozornění"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats Bar */}
        <StatsBar
          jars={jars}
          monthlyIncome={monthlyIncome}
          currentMonthName={getMonthCzechName()}
          onOpenDistribute={() => setIsDistributeOpen(true)}
          onOpenExpense={() => {
            setSelectedJarForTx('necessities');
            setTransactionType('expense');
            setIsTransactionOpen(true);
          }}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenRecurring={() => setIsRecurringOpen(true)}
          onResetJarsToZero={handleResetJarsToZero}
          onOpenInitialBalances={() => setIsInitialBalancesOpen(true)}
          recurringCount={recurringExpenses.filter((e) => e.active).length}
        />

        {/* Visual Financial Independence Indicator (Pravidlo 4 %) */}
        <FinancialIndependenceBar
          jars={jars}
          monthlyIncome={monthlyIncome}
          onOpenFinancialIndependence={() => setIsFIOpen(true)}
          onOpenCoach={() => setIsCoachOpen(true)}
        />

        {/* 7 Jars Grid */}
        <section id="jars-grid-section">
          {(() => {
            const activeJars = jars.filter((j) => j.enabled !== false);
            const disabledJars = jars.filter((j) => j.enabled === false);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-serif text-white tracking-tight">
                        Vaše finanční džbány
                      </h2>
                      {disabledJars.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-semibold">
                          {activeJars.length} z {jars.length} aktivních
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 font-normal mt-0.5">
                      Kliknutím na tlačítka můžete rychle evidovat výdaj, vklad nebo převod
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="btn-coach-shortcut"
                      onClick={() => setIsCoachOpen(true)}
                      title="Osobní finanční kouč Smart Life – Váš měsíční mentor"
                      className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] hover:text-white bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Finanční kouč</span>
                    </button>

                    <button
                      id="btn-fi-shortcut"
                      onClick={() => setIsFIOpen(true)}
                      title="Plánovač 10leté finanční nezávislosti (Smart Life & 7 džbánů)"
                      className="text-xs font-semibold uppercase tracking-wider text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>10 let k nezávislosti</span>
                    </button>

                    <button
                      id="btn-settings-shortcut"
                      onClick={() => setIsSettingsOpen(true)}
                      title="Spravovat a vybrat aktivní džbány"
                      className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Nastavení džbánů</span>
                    </button>

                    <button
                      id="btn-initial-balances-shortcut"
                      onClick={() => setIsInitialBalancesOpen(true)}
                      title="Nastavit počáteční nebo aktuální stav džbánů (přechod z jiné aplikace)"
                      className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/35 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Počáteční stav</span>
                    </button>

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
                      className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 px-3.5 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Rozdělit příjem
                    </button>
                  </div>
                </div>

                {disabledJars.length > 0 && (
                  <div className="mb-4 p-3 bg-[#161618] border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs text-white/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-white/30 shrink-0" />
                      <span className="truncate">
                        Vypnuté džbány ({disabledJars.length}):{' '}
                        <strong className="text-white/80 font-medium">
                          {disabledJars.map((j) => j.shortName).join(', ')}
                        </strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-[#d4af37] hover:underline font-semibold cursor-pointer shrink-0"
                    >
                      Změnit
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {activeJars.map((jar) => (
                    <JarCard
                      key={jar.id}
                      jar={jar}
                      monthlyIncome={monthlyIncome}
                      onDeposit={handleDepositQuick}
                      onExpense={handleExpenseQuick}
                      onTransfer={handleTransferQuick}
                      onShowDetail={(j) => setDetailJar(j)}
                      onOpenFinancialIndependence={() => setIsFIOpen(true)}
                    />
                  ))}
                </div>
              </>
            );
          })()}
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
        onOpenInitialBalances={() => {
          setDetailJar(null);
          setIsInitialBalancesOpen(true);
        }}
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
        onDeleteExpense={handleDeleteRecurringExpense}
        onExecuteExpenses={handleExecuteRecurringExpenses}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        jars={jars}
        onSaveJars={handleSaveJarsFromSettings}
        onOpenTransfer={(fromJarId) => {
          setSelectedJarForTx(fromJarId || 'necessities');
          setIsTransferOpen(true);
        }}
        onOpenInitialBalances={() => {
          setIsSettingsOpen(false);
          setIsInitialBalancesOpen(true);
        }}
      />

      <InitialBalancesModal
        isOpen={isInitialBalancesOpen}
        onClose={() => setIsInitialBalancesOpen(false)}
        jars={jars}
        onSaveBalances={handleSaveInitialBalances}
      />

      <FinancialIndependenceModal
        isOpen={isFIOpen}
        onClose={() => setIsFIOpen(false)}
        jars={jars}
        monthlyIncome={monthlyIncome}
        onOpenCoach={() => {
          setIsFIOpen(false);
          setIsCoachOpen(true);
        }}
      />

      <FinancialCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        jars={jars}
        monthlyIncome={monthlyIncome}
        transactions={transactions}
        currentMonthName={getMonthCzechName()}
        onOpenDistribute={() => setIsDistributeOpen(true)}
      />

      {/* Mobile Sticky Quick Navigation Dock */}
      <MobileNavDock
        onOpenDistribute={() => setIsDistributeOpen(true)}
        onOpenExpense={() => {
          setSelectedJarForTx('necessities');
          setTransactionType('expense');
          setIsTransactionOpen(true);
        }}
        onOpenCoach={() => setIsCoachOpen(true)}
        onOpenFinancialIndependence={() => setIsFIOpen(true)}
      />
    </div>
  );
}
