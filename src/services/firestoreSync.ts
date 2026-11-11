import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Jar, Transaction, RecurringExpense } from '../types';
import { DEFAULT_JARS } from '../data/defaultJars';

/**
 * Initializes or migrates user data to cloud if new account
 */
export async function initializeUserCloudData(
  userId: string,
  localJars: Jar[],
  localTransactions: Transaction[],
  localMonthlyIncome: number,
  localRecurringExpenses?: RecurringExpense[]
): Promise<{ migrated: boolean }> {
  try {
    const jarsRef = collection(db, 'users', userId, 'jars');
    const existingSnap = await getDocs(jarsRef);

    if (existingSnap.empty) {
      // New user or empty cloud data -> migrate current local data
      const batch = writeBatch(db);

      const jarsToSave = localJars && localJars.length === 7 ? localJars : DEFAULT_JARS;
      jarsToSave.forEach((jar) => {
        const jarDoc = doc(db, 'users', userId, 'jars', jar.id);
        batch.set(jarDoc, { ...jar, updatedAt: new Date().toISOString() });
      });

      // Also save user profile / settings doc
      const settingsDoc = doc(db, 'users', userId, 'settings', 'budget');
      batch.set(settingsDoc, {
        monthlyIncome: localMonthlyIncome || 45000,
        updatedAt: new Date().toISOString(),
      });

      // Save initial transactions (up to 50 recent)
      const txsToSave = localTransactions.slice(-50);
      txsToSave.forEach((tx) => {
        const txDoc = doc(db, 'users', userId, 'transactions', tx.id);
        batch.set(txDoc, tx);
      });

      // Save initial recurring expenses if present
      if (localRecurringExpenses && localRecurringExpenses.length > 0) {
        localRecurringExpenses.forEach((exp) => {
          const expDoc = doc(db, 'users', userId, 'recurring_expenses', exp.id);
          batch.set(expDoc, { ...exp, updatedAt: new Date().toISOString() });
        });
      }

      await batch.commit();
      return { migrated: true };
    }

    return { migrated: false };
  } catch (error) {
    console.error('Error initializing user cloud data:', error);
    return { migrated: false };
  }
}

/**
 * Save all jars in batch to Firestore
 */
export async function saveJarsToCloud(userId: string, jars: Jar[]): Promise<void> {
  if (!userId) return;
  try {
    const batch = writeBatch(db);
    jars.forEach((jar) => {
      const jarDoc = doc(db, 'users', userId, 'jars', jar.id);
      batch.set(jarDoc, { ...jar, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error saving jars to Firestore:', error);
    throw error;
  }
}

/**
 * Save a single transaction to Firestore
 */
export async function saveTransactionToCloud(userId: string, transaction: Transaction): Promise<void> {
  if (!userId) return;
  try {
    const txDoc = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(txDoc, transaction);
  } catch (error) {
    console.error('Error saving transaction to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a transaction from Firestore
 */
export async function deleteTransactionFromCloud(userId: string, transactionId: string): Promise<void> {
  if (!userId) return;
  try {
    const txDoc = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(txDoc);
  } catch (error) {
    console.error('Error deleting transaction from Firestore:', error);
    throw error;
  }
}

/**
 * Save planned monthly income to Firestore
 */
export async function saveMonthlyIncomeToCloud(userId: string, amount: number): Promise<void> {
  if (!userId) return;
  try {
    const settingsDoc = doc(db, 'users', userId, 'settings', 'budget');
    await setDoc(settingsDoc, { monthlyIncome: amount, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error saving income to Firestore:', error);
  }
}

/**
 * Save all recurring expenses in batch to Firestore
 */
export async function saveRecurringExpensesToCloud(
  userId: string,
  expenses: RecurringExpense[]
): Promise<void> {
  if (!userId) return;
  try {
    const recurringCol = collection(db, 'users', userId, 'recurring_expenses');
    const existingSnap = await getDocs(recurringCol);
    const incomingIds = new Set(expenses.map((e) => e.id));

    const batch = writeBatch(db);

    // Delete documents that were removed from the expenses list
    existingSnap.forEach((docSnap) => {
      if (!incomingIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    // Set or update remaining expenses
    expenses.forEach((exp) => {
      const expDoc = doc(db, 'users', userId, 'recurring_expenses', exp.id);
      batch.set(expDoc, { ...exp, updatedAt: new Date().toISOString() }, { merge: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error saving recurring expenses to Firestore:', error);
    throw error;
  }
}

/**
 * Save a single recurring expense to Firestore
 */
export async function saveSingleRecurringExpenseToCloud(
  userId: string,
  expense: RecurringExpense
): Promise<void> {
  if (!userId) return;
  try {
    const expDoc = doc(db, 'users', userId, 'recurring_expenses', expense.id);
    await setDoc(expDoc, { ...expense, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error saving recurring expense to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a recurring expense from Firestore
 */
export async function deleteRecurringExpenseFromCloud(
  userId: string,
  expenseId: string
): Promise<void> {
  if (!userId) return;
  try {
    const expDoc = doc(db, 'users', userId, 'recurring_expenses', expenseId);
    await deleteDoc(expDoc);
  } catch (error) {
    console.error('Error deleting recurring expense from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for jars, transactions, settings, and recurring expenses
 */
export function subscribeToUserCloudData(
  userId: string,
  callbacks: {
    onJarsUpdate: (jars: Jar[]) => void;
    onTransactionsUpdate: (txs: Transaction[]) => void;
    onIncomeUpdate: (income: number) => void;
    onRecurringExpensesUpdate?: (expenses: RecurringExpense[]) => void;
    onError?: (err: unknown) => void;
  }
): () => void {
  if (!userId) return () => {};

  // 1. Listen to jars
  const jarsCol = collection(db, 'users', userId, 'jars');
  const unsubJars = onSnapshot(
    jarsCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const cloudJars: Jar[] = [];
        snapshot.forEach((d) => {
          cloudJars.push(d.data() as Jar);
        });
        // Sort to standard order
        const orderMap: Record<string, number> = {
          necessities: 1,
          freedom: 2,
          emergency: 3,
          dreams: 4,
          education: 5,
          play: 6,
          give: 7,
        };
        cloudJars.sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));
        callbacks.onJarsUpdate(cloudJars);
      }
    },
    (err) => {
      console.warn('Firestore jars subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  // 2. Listen to transactions
  const txsCol = query(collection(db, 'users', userId, 'transactions'), orderBy('timestamp', 'desc'));
  const unsubTxs = onSnapshot(
    txsCol,
    (snapshot) => {
      const cloudTxs: Transaction[] = [];
      snapshot.forEach((d) => {
        cloudTxs.push(d.data() as Transaction);
      });
      callbacks.onTransactionsUpdate(cloudTxs);
    },
    (err) => {
      console.warn('Firestore txs subscription warning:', err);
      callbacks.onError?.(err);
    }
  );

  // 3. Listen to settings
  const settingsDoc = doc(db, 'users', userId, 'settings', 'budget');
  const unsubSettings = onSnapshot(
    settingsDoc,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && typeof data.monthlyIncome === 'number') {
          callbacks.onIncomeUpdate(data.monthlyIncome);
        }
      }
    },
    (err) => {
      console.warn('Firestore settings subscription warning:', err);
    }
  );

  // 4. Listen to recurring expenses
  const recurringCol = collection(db, 'users', userId, 'recurring_expenses');
  const unsubRecurring = onSnapshot(
    recurringCol,
    (snapshot) => {
      if (callbacks.onRecurringExpensesUpdate) {
        const cloudExpenses: RecurringExpense[] = [];
        snapshot.forEach((d) => {
          cloudExpenses.push(d.data() as RecurringExpense);
        });
        callbacks.onRecurringExpensesUpdate(cloudExpenses);
      }
    },
    (err) => {
      console.warn('Firestore recurring expenses subscription warning:', err);
    }
  );

  return () => {
    unsubJars();
    unsubTxs();
    unsubSettings();
    unsubRecurring();
  };
}
