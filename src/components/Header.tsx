import React from 'react';
import { Landmark, BookOpen, User, LogOut, Loader2, Sliders, TrendingUp, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
  onOpenFinancialIndependence?: () => void;
  onOpenCoach?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenAuth,
  onOpenSettings,
  onOpenFinancialIndependence,
  onOpenCoach,
  isSyncing = false,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-white/5 bg-[#0a0a0b]/90 backdrop-blur-md sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#161618] border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center shadow-lg shadow-black/40">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-white text-base sm:text-lg tracking-[0.18em] uppercase leading-tight font-['Cinzel',serif]">
                Sedm džbánů
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-full">
                7 Jars
              </span>
            </div>
            <p className="text-xs text-white/40 font-normal tracking-wide hidden sm:block mt-0.5">
              Osobní finanční systém pro svobodu, stabilitu i radost
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          {onOpenCoach && (
            <button
              id="btn-header-coach"
              onClick={onOpenCoach}
              title="Osobní finanční kouč Smart Life – Vedení krok za krokem"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#d4af37] hover:text-white bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Finanční kouč</span>
              <span className="sm:hidden">Kouč</span>
            </button>
          )}

          {onOpenFinancialIndependence && (
            <button
              id="btn-header-fi"
              onClick={onOpenFinancialIndependence}
              title="10 let k finanční nezávislosti (Smart Life & 7 džbánů)"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">10 let k nezávislosti</span>
              <span className="md:hidden">10 let</span>
            </button>
          )}

          <button
            id="btn-header-guide"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white/80 hover:text-[#d4af37] bg-[#161618] hover:bg-[#1f1f23] border border-white/10 hover:border-[#d4af37]/40 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">O metodě</span>
          </button>

          {onOpenSettings && (
            <button
              id="btn-header-settings"
              onClick={onOpenSettings}
              title="Nastavení aktivních džbánů"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-semibold text-white/80 hover:text-[#d4af37] bg-[#161618] hover:bg-[#1f1f23] border border-white/10 hover:border-[#d4af37]/40 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Nastavení</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161618] border border-white/10 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Uživatel'}
                    className="w-5 h-5 rounded-full border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] flex items-center justify-center font-bold">
                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        <span>Ukládám...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Cloud synchronizován</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <button
                id="btn-header-logout"
                onClick={logout}
                title="Odhlásit se"
                className="p-2 text-white/50 hover:text-rose-400 bg-[#161618] hover:bg-[#1f1f23] border border-white/10 hover:border-rose-500/30 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-header-login"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#d4af37]/10 active:scale-[0.98]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Přihlásit se</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
