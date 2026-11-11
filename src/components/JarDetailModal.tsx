import React from 'react';
import { Jar, Transaction } from '../types';
import { JarIcon } from './JarIcon';
import { formatCZK, formatDateCS } from '../utils/formatters';
import { X, CheckCircle, ShieldCheck, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Coins } from 'lucide-react';

interface JarDetailModalProps {
  jar: Jar | null;
  onClose: () => void;
  transactions: Transaction[];
  onAddExpense: (jarId: Jar['id']) => void;
  onAddDeposit: (jarId: Jar['id']) => void;
  onOpenInitialBalances?: () => void;
}

export const JarDetailModal: React.FC<JarDetailModalProps> = ({
  jar,
  onClose,
  transactions,
  onAddExpense,
  onAddDeposit,
  onOpenInitialBalances,
}) => {
  if (!jar) return null;

  const jarTransactions = transactions.filter(
    (tx) => tx.jarId === jar.id || tx.toJarId === jar.id
  );

  return (
    <div
      id="jar-detail-modal"
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
            <div className={`p-2 sm:p-2.5 rounded-xl ${jar.theme.iconBg} shrink-0`}>
              <JarIcon name={jar.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{jar.name}</h2>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${jar.theme.badgeBg} ${jar.theme.badgeText}`}>
                  {jar.percentage} %
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/40 font-normal mt-0.5">
                {jar.purpose}
              </p>
            </div>
          </div>
          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
          {/* Balance card */}
          <div className="p-4 rounded-xl bg-[#161618] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest block">
                Současný zůstatek
              </span>
              <span className="text-3xl font-extrabold text-white">
                {formatCZK(jar.balance)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-detail-expense"
                onClick={() => {
                  onClose();
                  onAddExpense(jar.id);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
              >
                - Zaznamenat výdaj
              </button>
              <button
                id="btn-detail-deposit"
                onClick={() => {
                  onClose();
                  onAddDeposit(jar.id);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
              >
                + Vložit peníze
              </button>
              {onOpenInitialBalances && (
                <button
                  id="btn-detail-adjust-balance"
                  onClick={() => {
                    onClose();
                    onOpenInitialBalances();
                  }}
                  title="Upravit počáteční nebo aktuální stav tohoto i ostatních džbánů"
                  className="px-3 py-2 text-xs font-semibold rounded-xl text-white/70 hover:text-[#d4af37] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Upravit stav</span>
                </button>
              )}
            </div>
          </div>

          {/* Golden rule */}
          <div className="p-4 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#e5e5e7] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-0.5">
                Zlaté pravidlo tohoto džbánu
              </h4>
              <p className="text-sm font-normal text-white/80 leading-relaxed">
                {jar.goldenRule}
              </p>
            </div>
          </div>

          {/* Detailed description */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              K čemu džbán slouží
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {jar.description}
            </p>
          </div>

          {/* Examples */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">
              Příklady typických položek
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jar.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161618] border border-white/5 text-xs font-medium text-white/80"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>{ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions for this jar */}
          <div>
            <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">
              Pohyby v tomto džbánu ({jarTransactions.length})
            </h4>

            {jarTransactions.length === 0 ? (
              <p className="text-xs text-white/30 italic p-4 text-center bg-[#161618] rounded-xl border border-dashed border-white/10">
                Zatím žádné zaznamenané transakce pro tento džbán.
              </p>
            ) : (
              <div className="space-y-2">
                {jarTransactions.slice(0, 10).map((tx) => {
                  const isIncoming =
                    tx.type === 'income_distribution' ||
                    tx.type === 'manual_deposit' ||
                    (tx.type === 'transfer' && tx.toJarId === jar.id);

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-[#161618] hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg border ${
                            isIncoming
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {tx.type === 'transfer' ? (
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          ) : isIncoming ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {tx.note || (isIncoming ? 'Příjem/Vklad' : 'Výdaj')}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-white/40">
                            <span>{formatDateCS(tx.date)}</span>
                            {tx.category && (
                              <>
                                <span>•</span>
                                <span className="text-white/60 font-medium">
                                  {tx.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold ${
                          isIncoming ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}{formatCZK(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
