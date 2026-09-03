import React, { useState } from 'react';
import {
  X,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  Sparkles,
  ArrowDownRight,
  Info,
  Check,
  CheckSquare,
  Square,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Jar, JarId, RecurringExpense, Transaction } from '../types';
import { formatCZK } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import { DEFAULT_RECURRING_EXPENSES } from '../data/defaultRecurringExpenses';

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  recurringExpenses: RecurringExpense[];
  onSaveExpenses: (expenses: RecurringExpense[]) => Promise<void> | void;
  onExecuteExpenses: (
    selectedExpenses: RecurringExpense[],
    date: string,
    targetMonth: string
  ) => Promise<void> | void;
}

const CATEGORY_SUGGESTIONS = [
  'Bydlení a nájem',
  'Energie a teplo',
  'Služby a internet',
  'Investice a spoření',
  'Pojištění',
  'Předplatné a média',
  'Vzdělávání a kurzy',
  'Doprava a splátky',
  'Ostatní trvalé platby',
];

export const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({
  isOpen,
  onClose,
  jars,
  recurringExpenses,
  onSaveExpenses,
  onExecuteExpenses,
}) => {
  // Current active tab: 'import' (zaúčtovat) or 'manage' (správa)
  const [activeTab, setActiveTab] = useState<'import' | 'manage'>('import');

  // Month selection for execution (e.g. "2026-03")
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [targetMonth, setTargetMonth] = useState<string>(currentMonthStr);
  const [executionDate, setExecutionDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Checkbox selections for execution (array of expense IDs)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    recurringExpenses.filter((e) => e.active).map((e) => e.id)
  );

  // New expense form state
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newJarId, setNewJarId] = useState<JarId>('necessities');
  const [newCategory, setNewCategory] = useState('Bydlení a nájem');
  const [newDay, setNewDay] = useState('15');
  const [newNote, setNewNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccessMsg, setExecutionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getJar = (id: JarId) => jars.find((j) => j.id === id);

  // Helper for human month name in Czech
  const formatMonthCS = (monthStr: string) => {
    try {
      const [y, m] = monthStr.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  // Active items
  const activeExpenses = recurringExpenses.filter((e) => e.active);

  // Selected items to be imported
  const selectedExpenses = activeExpenses.filter((e) => selectedIds.includes(e.id));
  const totalAmountToExecute = selectedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Per-jar deductions breakdown
  const deductionsByJar: Record<JarId, number> = {
    necessities: 0,
    freedom: 0,
    emergency: 0,
    dreams: 0,
    education: 0,
    play: 0,
    give: 0,
  };
  selectedExpenses.forEach((e) => {
    deductionsByJar[e.jarId] = (deductionsByJar[e.jarId] || 0) + e.amount;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === activeExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeExpenses.map((e) => e.id));
    }
  };

  const toggleItemSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(newAmount.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Zadejte platnou kladnou částku.');
      return;
    }

    if (!newName.trim()) {
      setFormError('Zadejte název trvalého příkazu.');
      return;
    }

    const dayNum = parseInt(newDay, 10);

    const newExpense: RecurringExpense = {
      id: `rec-${Date.now()}`,
      name: newName.trim(),
      amount: parsedAmount,
      jarId: newJarId,
      category: newCategory,
      dayOfMonth: isNaN(dayNum) ? undefined : dayNum,
      active: true,
      note: newNote.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...recurringExpenses];
    await onSaveExpenses(updated);
    setSelectedIds((prev) => [...prev, newExpense.id]);

    // Reset form
    setNewName('');
    setNewAmount('');
    setNewNote('');
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = recurringExpenses.filter((e) => e.id !== id);
    await onSaveExpenses(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleToggleExpenseActive = async (id: string) => {
    const updated = recurringExpenses.map((e) =>
      e.id === id ? { ...e, active: !e.active, updatedAt: new Date().toISOString() } : e
    );
    await onSaveExpenses(updated);
  };

  const handleLoadSampleExpenses = async () => {
    if (
      recurringExpenses.length > 0 &&
      !window.confirm('Chcete přidat vzorové české trvalé příkazy do vašeho seznamu?')
    ) {
      return;
    }
    const combined = [...recurringExpenses, ...DEFAULT_RECURRING_EXPENSES];
    await onSaveExpenses(combined);
    setSelectedIds(combined.filter((e) => e.active).map((e) => e.id));
  };

  const handleExecute = async () => {
    if (selectedExpenses.length === 0) {
      alert('Vyberte alespoň jeden trvalý příkaz k zaúčtování.');
      return;
    }

    setIsExecuting(true);
    setExecutionSuccessMsg(null);
    try {
      await onExecuteExpenses(selectedExpenses, executionDate, targetMonth);
      setExecutionSuccessMsg(
        `Úspěšně zaúčtováno ${selectedExpenses.length} trvalých příkazů v celkové výši ${formatCZK(
          totalAmountToExecute
        )} do přehledu transakcí a džbánů za ${formatMonthCS(targetMonth)}.`
      );
      // Auto close after 2.5 seconds or let user inspect
      setTimeout(() => {
        setExecutionSuccessMsg(null);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Error executing recurring expenses:', err);
      alert('Chyba při ukládání trvalých příkazů.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      id="recurring-expenses-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header - ALWAYS VISIBLE */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Pravidelné výdaje & Trvalé příkazy</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-white/40 font-normal">
                Zadejte jednou a každý měsíc jedním kliknutím zaúčtujte do džbánů
              </p>
            </div>
          </div>
          <button
            id="btn-close-recurring-modal"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - ALWAYS VISIBLE */}
        <div className="shrink-0 flex border-b border-white/5 px-4 sm:px-6 pt-2.5 sm:pt-3 bg-[#141416] overflow-x-auto">
          <button
            id="tab-recurring-import"
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Zaúčtovat na tento měsíc</span>
            {activeExpenses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#d4af37]/20 text-[#d4af37] text-[10px] rounded-full">
                {activeExpenses.length}
              </span>
            )}
          </button>

          <button
            id="tab-recurring-manage"
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manage'
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Správa & Přidat nové</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/10 text-white/60 text-[10px] rounded-full">
              {recurringExpenses.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Execute / Import to Overview */}
        {activeTab === 'import' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain">
            {/* Success message */}
            {executionSuccessMsg && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{executionSuccessMsg}</div>
              </div>
            )}

            {/* Target Month and Date configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#161618] p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Zaúčtovat pro měsíc
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-recurring-target-month"
                    type="month"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-semibold text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Datum vytvoření transakcí
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-recurring-date"
                    type="date"
                    value={executionDate}
                    onChange={(e) => setExecutionDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-semibold text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Empty state */}
            {recurringExpenses.length === 0 ? (
              <div className="p-8 text-center bg-[#161618] rounded-xl border border-white/5 space-y-3">
                <Repeat className="w-8 h-8 text-white/20 mx-auto" />
                <h4 className="text-sm font-bold text-white">Zatím nemáte nastavené žádné trvalé příkazy</h4>
                <p className="text-xs text-white/50 max-w-md mx-auto">
                  Vytvořte si seznam vašich pravidelných plateb (nájem, energie, internet, pojištění, investice), abyste je nemuseli každý měsíc vypisovat ručně.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleLoadSampleExpenses}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-xl transition-all"
                  >
                    Načíst vzorové trvalé příkazy
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('manage')}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all"
                  >
                    Vytvořit vlastní
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selection controls bar */}
                <div className="flex items-center justify-between text-xs text-white/60 px-1">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
                  >
                    {selectedIds.length === activeExpenses.length ? (
                      <CheckSquare className="w-4 h-4 text-[#d4af37]" />
                    ) : (
                      <Square className="w-4 h-4 text-white/40" />
                    )}
                    <span>
                      {selectedIds.length === activeExpenses.length
                        ? 'Odznačit vše'
                        : 'Označit všechny aktivní'}
                    </span>
                  </button>
                  <span>
                    Vybráno {selectedExpenses.length} z {activeExpenses.length} plateb
                  </span>
                </div>

                {/* Items checklist */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recurringExpenses.map((expense) => {
                    const jar = getJar(expense.jarId);
                    const isSelected = selectedIds.includes(expense.id);
                    const isExecutedForTargetMonth =
                      expense.lastExecutedMonth === targetMonth;

                    return (
                      <div
                        key={expense.id}
                        id={`rec-item-${expense.id}`}
                        onClick={() => toggleItemSelect(expense.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none gap-3 ${
                          isSelected
                            ? 'bg-[#161618] border-[#d4af37]/40 shadow-sm'
                            : 'bg-[#141416]/50 border-white/5 opacity-60 hover:opacity-100 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            aria-label="Označit položku"
                            className="text-white/40 hover:text-white transition-colors shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-[#d4af37]" />
                            ) : (
                              <Square className="w-5 h-5 text-white/30" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold text-white truncate">
                                {expense.name}
                              </span>
                              {isExecutedForTargetMonth && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md shrink-0">
                                  Již zaúčtováno
                                </span>
                              )}
                              {!expense.active && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/10 text-white/40 rounded-md shrink-0">
                                  Pozastaveno
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40 mt-0.5">
                              {jar && (
                                <span className="flex items-center gap-1 font-medium text-white/80">
                                  <JarIcon name={jar.icon} className="w-3 h-3 text-[#d4af37]" />
                                  <span>{jar.shortName}</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>{expense.category}</span>
                              {expense.dayOfMonth && (
                                <>
                                  <span>•</span>
                                  <span>obvykle {expense.dayOfMonth}. den</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-bold text-rose-300">
                            -{formatCZK(expense.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Box */}
                <div className="bg-[#161618] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                        Celkem k odečtení z rozpočtu
                      </p>
                      <p className="text-xl font-bold text-rose-300 mt-0.5">
                        -{formatCZK(totalAmountToExecute)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-white/40">
                        {selectedExpenses.length} vybraných položek
                      </span>
                    </div>
                  </div>

                  {/* Deductions breakdown per jar */}
                  {selectedExpenses.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2">
                        Odečty z jednotlivých džbánů:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {jars.map((jar) => {
                          const deduction = deductionsByJar[jar.id] || 0;
                          if (deduction === 0) return null;
                          const willBeNegative = jar.balance - deduction < 0;

                          return (
                            <div
                              key={jar.id}
                              className={`p-2 rounded-lg text-xs border ${
                                willBeNegative
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                  : 'bg-[#121214] border-white/5 text-white/70'
                              }`}
                            >
                              <div className="font-semibold truncate text-white">
                                {jar.shortName}
                              </div>
                              <div className="flex justify-between text-[11px] mt-0.5">
                                <span>Odečíst:</span>
                                <span className="font-bold text-rose-300">
                                  -{formatCZK(deduction)}
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
                                <span>Zůstatek po:</span>
                                <span
                                  className={
                                    willBeNegative ? 'text-rose-400 font-bold' : 'text-white/60'
                                  }
                                >
                                  {formatCZK(jar.balance - deduction)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Action Button */}
                <button
                  id="btn-execute-recurring"
                  type="button"
                  disabled={selectedExpenses.length === 0 || isExecuting}
                  onClick={handleExecute}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 disabled:opacity-40 transition-all shadow-lg shadow-[#d4af37]/10 cursor-pointer active:scale-[0.99]"
                >
                  <Repeat className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>
                    {isExecuting
                      ? 'Zaúčtovávám do přehledu...'
                      : `Zaúčtovat do rozpočtu za ${formatMonthCS(targetMonth)} (${formatCZK(
                          totalAmountToExecute
                        )})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage & Add Standing Orders */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain">
            {/* Add New Expense Form */}
            <form
              onSubmit={handleAddExpense}
              className="bg-[#161618] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <span>Přidat nový trvalý příkaz</span>
                </h4>
                <button
                  type="button"
                  onClick={handleLoadSampleExpenses}
                  className="text-[11px] text-[#d4af37] hover:underline"
                >
                  + Načíst vzorové platby
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Název / Účel platby *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="např. Nájemné, Internet, Netflix, Plyn"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Měsíční částka v Kč *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="např. 14000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                {/* Jar */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Přiřadit ke džbánu *
                  </label>
                  <select
                    value={newJarId}
                    onChange={(e) => setNewJarId(e.target.value as JarId)}
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    {jars.map((j) => (
                      <option key={j.id} value={j.id} className="bg-[#121214] text-white">
                        {j.name} ({j.percentage} %)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Kategorie výdaje
                  </label>
                  <input
                    type="text"
                    list="categories-list"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white focus:border-[#d4af37] focus:outline-none"
                  />
                  <datalist id="categories-list">
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Day of month */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Den v měsíci (orientační)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    placeholder="1 - 31"
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                    Poznámka (volitelná)
                  </label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="např. variabilní symbol nebo číslo smlouvy"
                    className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-xs font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-save-recurring-item"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#c59e2b] text-[#0a0a0b] text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Uložit trvalý příkaz</span>
              </button>
            </form>

            {/* List of current expenses */}
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                Uložené trvalé příkazy ({recurringExpenses.length})
              </h4>

              {recurringExpenses.length === 0 ? (
                <p className="text-xs text-white/40 italic">Zatím nejsou uloženy žádné trvalé příkazy.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {recurringExpenses.map((expense) => {
                    const jar = getJar(expense.jarId);
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-[#161618] border border-white/5 rounded-xl hover:border-white/10 transition-all gap-3"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleExpenseActive(expense.id)}
                            title={expense.active ? 'Aktivní (kliknutím pozastavit)' : 'Pozastaveno (kliknutím aktivovat)'}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                              expense.active
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                          >
                            {expense.active ? 'Aktivní' : 'Vypnuto'}
                          </button>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {expense.name}
                            </p>
                            <p className="text-[11px] text-white/40 truncate">
                              {jar?.shortName} • {expense.category}
                              {expense.dayOfMonth && ` • ${expense.dayOfMonth}. den`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {formatCZK(expense.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            title="Smazat trvalý příkaz"
                            className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
