import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already opened as standalone app on home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        id="btn-install-pwa"
        onClick={handleAction}
        title="Uložit na plochu telefonu"
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold text-[#d4af37] hover:text-white bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 hover:border-[#d4af37]/60 rounded-xl transition-all shadow-xs cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
        <span className="hidden sm:inline">Na plochu</span>
      </button>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/80">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Preview */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative mb-3">
                <img
                  src="/apple-touch-icon.png"
                  alt="Ikona aplikace na plochu"
                  className="w-20 h-20 rounded-2xl shadow-xl shadow-black/60 border border-[#d4af37]/40 p-0.5 bg-[#121214]"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-black rounded-full shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="font-['Cinzel',serif] text-lg font-bold text-white tracking-wider">
                Přidat na plochu telefonu
              </h3>
              <p className="text-xs text-white/60 mt-1 max-w-xs">
                Aplikace se uloží na vaši domovskou obrazovku se zlatou ikonou chrámu
              </p>
            </div>

            {/* Step-by-step guidance */}
            <div className="space-y-3 text-left mb-6">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">1. Otevřete menu Sdílet</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        V Safari klepněte dole uprostřed na ikonu sdílení (čtvereček se šipkou nahoru).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">2. Zvolte „Přidat na plochu“</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        V nabídce sjeďte dolů a vyberte možnost <strong className="text-white">Přidat na plochu</strong> (+).
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {isInstallable && (
                    <button
                      onClick={async () => {
                        await install();
                        setShowGuide(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8420] text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition cursor-pointer mb-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Instalovat nyní na plochu</span>
                    </button>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold font-mono">⋮</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">1. Otevřete menu prohlížeče</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        V Chrome nebo jiném prohlížeči klepněte na tři tečky v pravém horním rohu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">2. Přidat na plochu / Instalovat</p>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Zvolte <strong className="text-white">Přidat na plochu</strong> nebo <strong className="text-white">Instalovat aplikaci</strong>.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition"
            >
              Rozumím
            </button>
          </div>
        </div>
      )}
    </>
  );
};
