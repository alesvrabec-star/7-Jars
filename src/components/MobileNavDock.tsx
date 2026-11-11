import React from 'react';
import { Sparkles, MinusCircle, Compass, TrendingUp, Landmark } from 'lucide-react';

interface MobileNavDockProps {
  onOpenDistribute: () => void;
  onOpenExpense: () => void;
  onOpenCoach: () => void;
  onOpenFinancialIndependence: () => void;
  onScrollToJars?: () => void;
}

export const MobileNavDock: React.FC<MobileNavDockProps> = ({
  onOpenDistribute,
  onOpenExpense,
  onOpenCoach,
  onOpenFinancialIndependence,
  onScrollToJars,
}) => {
  const handleScrollToJars = () => {
    if (onScrollToJars) {
      onScrollToJars();
    } else {
      const el = document.getElementById('jars-grid-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav
      id="mobile-bottom-nav-dock"
      aria-label="Mobilní rychlé akce"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0d0d0f]/95 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {/* Džbány shortcut */}
        <button
          type="button"
          onClick={handleScrollToJars}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white/60 hover:text-white transition-colors active:scale-95"
        >
          <Landmark className="w-4 h-4 text-[#d4af37]" />
          <span className="text-[10px] font-medium tracking-tight">Džbány</span>
        </button>

        {/* Rozdělit příjem */}
        <button
          type="button"
          onClick={onOpenDistribute}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[#d4af37] hover:text-white transition-colors active:scale-95"
        >
          <div className="p-1 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Rozdělit</span>
        </button>

        {/* Zadat výdaj */}
        <button
          type="button"
          onClick={onOpenExpense}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-rose-300 hover:text-rose-200 transition-colors active:scale-95"
        >
          <div className="p-1 rounded-lg bg-rose-500/15 border border-rose-500/30">
            <MinusCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Výdaj</span>
        </button>

        {/* Finanční kouč */}
        <button
          type="button"
          onClick={onOpenCoach}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white/70 hover:text-[#d4af37] transition-colors active:scale-95"
        >
          <Compass className="w-4 h-4 text-[#d4af37]" />
          <span className="text-[10px] font-medium tracking-tight">Kouč</span>
        </button>

        {/* 10 let k nezávislosti */}
        <button
          type="button"
          onClick={onOpenFinancialIndependence}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-emerald-400 hover:text-emerald-300 transition-colors active:scale-95"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-medium tracking-tight">10 let</span>
        </button>
      </div>
    </nav>
  );
};
