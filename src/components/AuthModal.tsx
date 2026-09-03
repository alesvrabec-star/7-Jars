import React, { useState } from 'react';
import { X, Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    authError,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setResetSuccessMessage(null);

    if (mode === 'signup') {
      if (password !== passwordConfirm) {
        setLocalError('Zadaná hesla se neshodují.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Heslo musí mít alespoň 6 znaků.');
        return;
      }
      setIsSubmitting(true);
      try {
        await signUpWithEmail(email, password);
        onClose();
      } catch {
        // error handled in context
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'signin') {
      setIsSubmitting(true);
      try {
        await signInWithEmail(email, password);
        onClose();
      } catch {
        // error handled in context
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'reset') {
      setIsSubmitting(true);
      try {
        await resetPassword(email);
        setResetSuccessMessage('Instrukce pro obnovu hesla byly odeslány na váš e-mail.');
      } catch {
        // error handled in context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      id="auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#121214] rounded-2xl shadow-2xl border border-white/10 text-[#e5e5e7] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161618]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {mode === 'reset'
                  ? 'Obnova zapomenutého hesla'
                  : mode === 'signup'
                  ? 'Vytvoření nového účtu'
                  : 'Přihlášení do Sedmi džbánů'}
              </h2>
              <p className="text-xs text-white/40 font-normal">
                Synchronizujte své finance na všech svých zařízeních
              </p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Tabs (Sign in / Sign up) */}
          {mode !== 'reset' && (
            <div className="flex rounded-xl bg-[#161618] p-1 border border-white/5">
              <button
                type="button"
                id="tab-auth-signin"
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Přihlásit se
              </button>
              <button
                type="button"
                id="tab-auth-signup"
                onClick={() => {
                  setMode('signup');
                  setLocalError(null);
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Registrovat se
              </button>
            </div>
          )}

          {/* Quick Google Sign In */}
          {mode !== 'reset' && (
            <div>
              <button
                id="btn-signin-google"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#161618] hover:bg-white/10 border border-white/15 hover:border-[#d4af37]/40 rounded-xl text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Přihlásit se jedním klikem přes Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#121214] px-3 text-[11px] text-white/40 uppercase tracking-widest">
                    nebo e-mailem
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {(authError || localError) && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-rose-400 shrink-0">Chyba:</span>
                <span className="leading-relaxed">{authError || localError}</span>
              </div>
              {(authError?.includes('Authorized domains') || authError?.includes('Vercel')) && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] text-white/70 space-y-1">
                  <p className="font-semibold text-[#d4af37]">Jak to rychle vyřešit v konzoli Firebase:</p>
                  <ol className="list-decimal list-inside space-y-1 text-white/60 pl-1">
                    <li>Otevřete <strong className="text-white">console.firebase.google.com</strong></li>
                    <li>Vyberte váš projekt a přejděte na <strong className="text-white">Authentication → Settings → Authorized domains</strong></li>
                    <li>Klikněte na <strong className="text-white">Add domain</strong> a vložte doménu vašeho Vercel webu (např. <code className="text-[#d4af37]">vas-projekt.vercel.app</code>)</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
              <span className="font-bold">Hotovo:</span>
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5"
              >
                E-mailová adresa
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="např. jan.novak@seznam.cz"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password-input"
                    className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest"
                  >
                    Heslo
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setLocalError(null);
                        clearError();
                      }}
                      className="text-[11px] text-[#d4af37]/80 hover:text-[#d4af37] transition-colors"
                    >
                      Zapomněli jste heslo?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimálně 6 znaků"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-password-confirm-input"
                  className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1.5"
                >
                  Potvrzení hesla
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-confirm-input"
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Zadejte heslo znovu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#161618] border border-white/10 rounded-xl text-sm font-medium text-white placeholder-white/25 focus:border-[#d4af37] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-[#0a0a0b] bg-gradient-to-r from-[#d4af37] to-[#c59e2b] hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-[#d4af37]/10 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pracuji...</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Vytvořit účet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'reset' ? (
                <span>Odeslat odkaz pro obnovu hesla</span>
              ) : (
                <>
                  <span>Přihlásit se do systému</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Reset password back to signin link */}
          {mode === 'reset' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                  clearError();
                }}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                ← Zpět na přihlášení
              </button>
            </div>
          )}

          {/* Security guarantee */}
          <div className="pt-2 border-t border-white/5 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed">
              🔒 Vaše finanční údaje jsou bezpečně šifrovány. Nikdy je nesdílíme s třetími stranami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
