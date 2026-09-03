import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { FINANCIAL_TIPS, FinancialTip } from '../data/financialTips';

const LAST_TIP_KEY = 'seven_jars_last_tip_id';

function getRandomTip(excludeId?: number): FinancialTip {
  const available = excludeId
    ? FINANCIAL_TIPS.filter((t) => t.id !== excludeId)
    : FINANCIAL_TIPS;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex] || FINANCIAL_TIPS[0];
}

export const FinancialWisdomBanner: React.FC = () => {
  const [tip, setTip] = useState<FinancialTip>(() => {
    try {
      const lastIdStr = sessionStorage.getItem(LAST_TIP_KEY);
      const lastId = lastIdStr ? parseInt(lastIdStr, 10) : undefined;
      const selected = getRandomTip(lastId);
      sessionStorage.setItem(LAST_TIP_KEY, selected.id.toString());
      return selected;
    } catch {
      return getRandomTip();
    }
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const handleNextTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setTip((prev) => {
        const next = getRandomTip(prev.id);
        try {
          sessionStorage.setItem(LAST_TIP_KEY, next.id.toString());
        } catch {
          // ignore
        }
        return next;
      });
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div
      id="financial-wisdom-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141416] via-[#161619] to-[#121214] border border-[#d4af37]/25 p-4 sm:p-5 shadow-xl transition-all"
    >
      {/* Subtle decorative glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 shrink-0 mt-0.5">
            <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {tip.category}
              </span>
              <span className="text-[11px] text-white/40 hidden sm:inline">
                • Inspirace pro vaše finance
              </span>
            </div>

            <p
              className={`text-xs sm:text-sm text-white/90 font-serif italic leading-relaxed transition-opacity duration-200 ${
                isAnimating ? 'opacity-20' : 'opacity-100'
              }`}
            >
              „{tip.quote}“
            </p>

            <div className="text-[11px] sm:text-xs font-sans text-[#d4af37]/80 font-medium flex items-center gap-1.5">
              <span className="w-4 h-[1px] bg-[#d4af37]/40 inline-block" />
              <span>{tip.author}</span>
            </div>
          </div>
        </div>

        {/* Change quote button */}
        <button
          id="btn-next-financial-tip"
          type="button"
          onClick={handleNextTip}
          title="Zobrazit jiné moudro nebo tip"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl transition-all shrink-0 self-end sm:self-center cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#d4af37] ${isAnimating ? 'animate-spin' : ''}`} />
          <span>Další tip</span>
        </button>
      </div>
    </div>
  );
};
