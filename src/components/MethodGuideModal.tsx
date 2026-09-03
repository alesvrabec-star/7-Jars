import React from 'react';
import { X, BookOpen, CheckCircle, Sparkles, AlertCircle, HelpCircle, Shield, Target } from 'lucide-react';
import { DEFAULT_JARS } from '../data/defaultJars';
import { JarIcon } from './JarIcon';

interface MethodGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodGuideModal: React.FC<MethodGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="method-guide-modal"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header - ALWAYS VISIBLE */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Průvodce: Jak funguje metoda Sedmi džbánů
              </h2>
              <p className="text-[11px] sm:text-xs text-white/40 font-normal">
                Kompletní přehled principů, psychologie a praktického využití
              </p>
            </div>
          </div>
          <button
            id="btn-close-guide-modal"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-white/80 text-sm overscroll-contain">
          {/* Intro Box */}
          <div className="p-4 rounded-2xl bg-[#161618] border border-[#d4af37]/30 text-[#e5e5e7]">
            <h3 className="font-bold text-base text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Ano, metodu Sedm džbánů velmi dobře znám!
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Metoda <strong>Sedmi džbánů</strong> (vycházející z celosvětově uznávané metody šesti džbánů T. Harva Ekera, obohacené o samostatnou pohotovostní rezervu) je jedním z nejúčinnějších nástrojů osobních financí. Namísto frustrujícího zpětného počítání každé koruny vám dává <strong>předem jasný plán</strong> pro každou korunu, kterou vyděláte.
            </p>
          </div>

          {/* 3 Core Principles */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#d4af37]" />
              Tři klíčové pilíře, proč tato metoda funguje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                <p className="font-bold text-white text-xs mb-1">1. Zaplaťte nejprve sobě</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Jakmile dorazí výplata, nečekáte, co zbude na konci měsíce. Ihned rozdělíte peníze do džbánů na investice, rezervu i zábavu.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                <p className="font-bold text-white text-xs mb-1">2. Utrácení bez výčitek</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Džbán Zábavy (10 %) má povinnost být utracen! Zbavuje vás pocitu viny, když si koupíte radost, protože investice a účty máte předem zajištěné.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161618] border border-white/5">
                <p className="font-bold text-white text-xs mb-1">3. Žádné dluhy ze zvyku</p>
                <p className="text-xs text-white/60 leading-relaxed">
                  Na dovolenou, auto či Vánoce spoříte předem do džbánu Snů a cílů. Nečekané události zase kryje Nouzová rezerva.
                </p>
              </div>
            </div>
          </div>

          {/* The 7 Jars Detailed Breakdown */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Přehled všech 7 džbánů a jejich doporučený poměr
            </h3>

            <div className="space-y-3">
              {DEFAULT_JARS.map((jar) => (
                <div
                  key={jar.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-[#161618] hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${jar.theme.iconBg}`}>
                        <JarIcon name={jar.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{jar.name}</h4>
                        <span className="text-xs text-white/40 font-normal">{jar.purpose}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${jar.theme.badgeBg} ${jar.theme.badgeText}`}>
                      {jar.percentage} %
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/70 leading-relaxed">
                    {jar.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-start gap-1.5 text-xs text-[#d4af37]">
                    <span className="font-bold shrink-0">💡 Zásada:</span>
                    <span className="text-white/80">{jar.goldenRule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Implementation in Real Life */}
          <div className="p-4 rounded-xl bg-[#161618] border border-white/10">
            <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Jak metodu provozovat v praxi v Česku?
            </h3>
            <ul className="space-y-1.5 text-xs text-white/60 list-disc list-inside">
              <li>
                <strong>Bankovní podúčty / obálky:</strong> Většina českých bank (např. Air Bank, Česká spořitelna, mBank, Raiffeisenbank, ČSOB) nabízí virtuální spořicí obálky zdarma. Každý měsíc po výplatě nastavte trvalé příkazy do těchto obálek.
              </li>
              <li>
                <strong>Tato aplikace jako řídící centrum:</strong> Zde si evidujte rozdělení každého příjmu a sledujte průběžný stav zůstatků a výdajů.
              </li>
              <li>
                <strong>Přizpůsobte si procenta:</strong> 50/10/10/10/5/10/5 je ideální model. Pokud máte vyšší nájem, můžete začít např. 60 % na nutnosti a postupně optimalizovat.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
