export type JarId = 
  | 'necessities'
  | 'freedom'
  | 'emergency'
  | 'dreams'
  | 'education'
  | 'play'
  | 'give';

export interface Jar {
  id: JarId;
  name: string;
  shortName: string;
  percentage: number; // e.g. 50
  balance: number; // Current funds in jar (CZK)
  enabled?: boolean; // Whether jar is active (defaults to true)
  colorKey: string;
  theme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    fillColor: string;
    cardBg: string;
    accentColor: string;
    iconBg: string;
  };
  icon: string;
  purpose: string;
  description: string;
  examples: string[];
  goldenRule: string;
}

export type TransactionType = 'income_distribution' | 'expense' | 'manual_deposit' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  amount: number; // positive number
  type: TransactionType;
  jarId: JarId;
  toJarId?: JarId; // for transfers
  category?: string;
  note: string;
  isRecurring?: boolean;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  jarId: JarId;
  category: string;
  dayOfMonth?: number;
  active: boolean;
  lastExecutedMonth?: string; // Format: "YYYY-MM", e.g. "2026-03"
  note?: string;
  updatedAt?: string;
}

export interface PresetAllocation {
  id: string;
  name: string;
  description: string;
  percentages: Record<JarId, number>;
}
