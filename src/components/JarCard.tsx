import React from 'react';
import { Jar, JarId } from '../types';
import { JarIcon } from './JarIcon';
import { formatCZK } from '../utils/formatters';
import { Plus, Minus, Info, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface JarCardProps {
  jar: Jar;
  monthlyIncome: number;
  onDeposit: (jarId: JarId) => void;
  onExpense: (jarId: JarId) => void;
  onTransfer: (jarId: JarId) => void;
  onShowDetail: (jar: Jar) => void;
  onOpenFinancialIndependence?: () => void;
}

export const JarCard: React.FC<JarCardProps> = ({
  jar,
  monthlyIncome,
  onDeposit,
  onExpense,
  onTransfer,
  onShowDetail,
  onOpenFinancialIndependence,
}) => {
  const monthlyShare = Math.round((monthlyIncome * jar.percentage) / 100);
  
  // Visual fill calculation (cap between 5% and 100%)
  // We compare balance to monthly share (if monthly share is 0, default to balance / 10000)
  const targetRef = monthlyShare > 0 ? monthlyShare * 2 : 10000;
  const fillPercentage = Math.min(100, Math.max(10, Math.round((jar.balance / targetRef) * 100)));

  return (
    <div
      id={`jar-card-${jar.id}`}
      className="relative flex flex-col justify-between rounded-2xl bg-[#121214] border border-white/10 hover:border-[#d4af37]/40 shadow-xl transition-all duration-200 overflow-hidden group"
    >
      {/* Top Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-xs ${jar.theme.iconBg}`}>
              <JarIcon name={jar.icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base leading-snug flex items-center gap-1.5">
                {jar.name}
              </h3>
              <p className="text-xs text-white/50 font-normal line-clamp-1">
                {jar.purpose}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              id={`jar-percentage-${jar.id}`}
              className={`px-2.5 py-1 text-xs font-bold rounded-full border ${jar.theme.badgeBg} ${jar.theme.badgeText}`}
            >
              {jar.percentage} %
            </span>
            <button
              id={`btn-jar-info-${jar.id}`}
              onClick={() => onShowDetail(jar)}
              title="Podrobnosti a pravidla džbánu"
              className="p-1.5 text-white/40 hover:text-[#d4af37] hover:bg-white/5 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Jar Visual Tank / Balance */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
              Aktuální zůstatek
            </span>
            <span className="text-xs text-white/40 font-medium">
              příděl: ~{formatCZK(monthlyShare)}/měs.
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              id={`jar-balance-${jar.id}`}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              {formatCZK(jar.balance)}
            </span>
          </div>

          {/* Fluid fill progress bar container */}
          <div className="mt-3 relative h-2.5 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${jar.theme.fillColor}`}
              style={{
                width: `${fillPercentage}%`,
                backgroundColor: jar.theme.accentColor,
              }}
            />
          </div>
        </div>

        {/* Golden rule preview */}
        <p className="mt-3 text-xs text-white/60 line-clamp-2 bg-[#161618] p-2.5 rounded-xl border border-white/5 leading-relaxed">
          <span className="font-semibold text-[#d4af37]">Zásada: </span>
          {jar.goldenRule}
        </p>

        {/* Smart Life Financial Independence Link for Freedom Jar */}
        {jar.id === 'freedom' && onOpenFinancialIndependence && (
          <button
            id="btn-jar-freedom-fi"
            type="button"
            onClick={onOpenFinancialIndependence}
            className="mt-2.5 w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs text-emerald-300 font-semibold transition-all cursor-pointer group/fi"
          >
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              10 let k nezávislosti (Smart Life)
            </span>
            <span className="text-[11px] text-emerald-400 group-hover/fi:translate-x-0.5 transition-transform">
              Plánovač →
            </span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#161618]/90 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          id={`btn-expense-${jar.id}`}
          onClick={() => onExpense(jar.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-semibold rounded-xl text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/20 transition-all cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5 shrink-0" />
          <span>Výdaj</span>
        </button>

        <button
          id={`btn-deposit-${jar.id}`}
          onClick={() => onDeposit(jar.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-semibold rounded-xl text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Vložit</span>
        </button>

        <button
          id={`btn-transfer-${jar.id}`}
          onClick={() => onTransfer(jar.id)}
          title="Převést do jiného džbánu"
          className="p-2 sm:p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer shrink-0"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
