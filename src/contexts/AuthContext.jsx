import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext();

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Add VITE_FIREBASE_* variables to your .env file and restart the dev server.'
    );
  }
}

export function getAuthErrorMessage(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Try again when you’re ready.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This site is not authorized in Firebase. Add your domain under Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Enable Email/Password or Google in Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

async function maybeSendVerification(user) {
  if (!user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch (verificationError) {
      console.warn('Could not send verification email:', verificationError);
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    assertFirebaseConfigured();
    const result = await signInWithPopup(auth, googleProvider);
    await maybeSendVerification(result.user);
    return result.user;
  };

  const signInWithEmail = async (email, password) => {
    assertFirebaseConfigured();
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  };

  const registerWithEmail = async (email, password) => {
    assertFirebaseConfigured();
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await maybeSendVerification(result.user);
    return result.user;
  };

  const logout = () => {
    if (!auth) return Promise.resolve();
    return signOut(auth);
  };

  const refreshUser = async () => {
    if (auth?.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isFirebaseConfigured,
    getAuthErrorMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
