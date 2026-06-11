import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to send verification email
  const sendVerification = async (currentUser) => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // If they aren't verified yet, send the email
      if (!result.user.emailVerified) {
        await sendVerification(result.user);
      }
      
      return result.user;
    } catch (error) {
      console.error("Authentication Error:", error);
      return null;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  // Used to refresh the user data (to check if they clicked the email link)
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading, // Exporting loading so pages know to wait for Firebase
    signInWithGoogle,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);