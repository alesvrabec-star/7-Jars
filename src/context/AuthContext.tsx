import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFriendlyErrorMessage(error: AuthError | Error | unknown): string {
  if (!error || typeof error !== 'object') return 'Došlo k neočekávané chybě.';
  const code = 'code' in error ? (error as AuthError).code : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Zadaná e-mailová adresa má neplatný formát.';
    case 'auth/user-disabled':
      return 'Tento uživatelský účet byl zablokován.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Nesprávný e-mail nebo heslo. Zkontrolujte prosím zadané údaje.';
    case 'auth/email-already-in-use':
      return 'Účet s tímto e-mailem již existuje. Přihlaste se prosím.';
    case 'auth/weak-password':
      return 'Heslo je příliš krátké. Zvolte prosím alespoň 6 znaků.';
    case 'auth/popup-closed-by-user':
      return 'Přihlašovací okno Google bylo zavřeno před dokončením.';
    case 'auth/popup-blocked':
      return 'Prohlížeč zablokoval vyskakovací okno. Povolte prosím vyskakovací okna nebo použijte e-mail a heslo.';
    case 'auth/network-request-failed':
      return 'Chyba připojení k internetu. Zkontrolujte prosím síťové spojení.';
    case 'auth/too-many-requests':
      return 'Příliš mnoho neúspěšných pokusů. Zkuste to prosím za chvíli.';
    default:
      return 'Nastala chyba při ověřování. Zkuste to prosím znovu.';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setAuthError(getFriendlyErrorMessage(err));
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err) {
      console.error('Email sign-in error:', err);
      setAuthError(getFriendlyErrorMessage(err));
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err) {
      console.error('Email sign-up error:', err);
      setAuthError(getFriendlyErrorMessage(err));
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      console.error('Password reset error:', err);
      setAuthError(getFriendlyErrorMessage(err));
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      setAuthError(getFriendlyErrorMessage(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
