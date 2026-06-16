import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { useAuth } from './AuthContext';

const RATINGS_STORAGE_KEY = 'fliks-ratings';
const WATCHLATER_STORAGE_KEY = 'fliks-watch-later';
const LEGACY_RATINGS_KEYS = ['movieMeterRatings'];
const LEGACY_WATCHLATER_KEYS = ['movie-meter-watch-later'];

const UserDataContext = createContext(null);

function readLegacyRatings() {
  try {
    const current = localStorage.getItem(RATINGS_STORAGE_KEY);
    if (current) return JSON.parse(current) || {};
    for (const key of LEGACY_RATINGS_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) return JSON.parse(legacy) || {};
    }
    return {};
  } catch {
    return {};
  }
}

function readLegacyWatchLater() {
  try {
    const current = localStorage.getItem(WATCHLATER_STORAGE_KEY);
    if (current) return JSON.parse(current) || [];
    for (const key of LEGACY_WATCHLATER_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) return JSON.parse(legacy) || [];
    }
    return [];
  } catch {
    return [];
  }
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem(RATINGS_STORAGE_KEY);
    localStorage.removeItem(WATCHLATER_STORAGE_KEY);
    LEGACY_RATINGS_KEYS.forEach((key) => localStorage.removeItem(key));
    LEGACY_WATCHLATER_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

export function UserDataProvider({ children }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({});
  const [watchLater, setWatchLater] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);
  const [hasMigratedLegacy, setHasMigratedLegacy] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setRatings({});
      setWatchLater([]);
      setLoading(false);
      return undefined;
    }

    if (!user) {
      setRatings({});
      setWatchLater([]);
      setLoading(false);
      setSyncError(null);
      setHasMigratedLegacy(false);
      return undefined;
    }

    setLoading(true);
    setSyncError(null);

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        const data = snapshot.data();
        let nextRatings = data?.ratings || {};
        let nextWatchLater = data?.watchLater || [];

        const legacyRatings = readLegacyRatings();
        const legacyWatchLater = readLegacyWatchLater();
        const hasLegacyData =
          Object.keys(legacyRatings).length > 0 || legacyWatchLater.length > 0;
        const docEmpty =
          !snapshot.exists() ||
          (Object.keys(nextRatings).length === 0 && nextWatchLater.length === 0);

        if (!hasMigratedLegacy && hasLegacyData && docEmpty) {
          nextRatings = { ...legacyRatings, ...nextRatings };
          nextWatchLater = [...legacyWatchLater, ...nextWatchLater];
          try {
            await setDoc(
              userRef,
              {
                ratings: nextRatings,
                watchLater: nextWatchLater,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
            clearLegacyStorage();
            setHasMigratedLegacy(true);
            return;
          } catch (migrationError) {
            console.error('Failed to migrate local data to Firestore:', migrationError);
          }
        }

        setRatings(nextRatings);
        setWatchLater(nextWatchLater);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore sync error:', error);
        const message =
          error.code === 'permission-denied'
            ? 'Firestore access denied. Enable Firestore in Firebase Console and deploy security rules (see firestore.rules).'
            : error.message || 'Could not sync your account data.';
        setSyncError(message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, hasMigratedLegacy]);

  const persistUserData = useCallback(
    async (partial) => {
      if (!user || !db) {
        throw Object.assign(new Error('Sign in required'), { code: 'auth/required' });
      }
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...partial, updatedAt: serverTimestamp() }, { merge: true });
    },
    [user]
  );

  const rateMovie = useCallback(
    async (movieId, value) => {
      if (!user) {
        alert('Please sign in to rate movies.');
        throw Object.assign(new Error('Sign in required'), { code: 'auth/required' });
      }

      const key = String(movieId);
      const nextRatings = { ...ratings, [key]: value };
      setRatings(nextRatings);

      try {
        await persistUserData({ ratings: nextRatings });
      } catch (error) {
        setRatings(ratings);
        throw error;
      }
    },
    [user, ratings, persistUserData]
  );

  const addToWatchLater = useCallback(
    async (movie) => {
      if (!user) {
        alert('Please sign in to save movies to your watchlist.');
        throw Object.assign(new Error('Sign in required'), { code: 'auth/required' });
      }

      if (watchLater.some((m) => m.id === movie.id)) return;

      const nextWatchLater = [...watchLater, movie];
      setWatchLater(nextWatchLater);

      try {
        await persistUserData({ watchLater: nextWatchLater });
      } catch (error) {
        setWatchLater(watchLater);
        throw error;
      }
    },
    [user, watchLater, persistUserData]
  );

  const removeFromWatchLater = useCallback(
    async (movieId) => {
      if (!user) return;

      const nextWatchLater = watchLater.filter((m) => m.id !== movieId);
      setWatchLater(nextWatchLater);

      try {
        await persistUserData({ watchLater: nextWatchLater });
      } catch (error) {
        setWatchLater(watchLater);
        throw error;
      }
    },
    [user, watchLater, persistUserData]
  );

  const isInWatchLater = useCallback(
    (movieId) => watchLater.some((m) => m.id === movieId),
    [watchLater]
  );

  const value = useMemo(
    () => ({
      ratings,
      watchLater,
      loading,
      syncError,
      rateMovie,
      addToWatchLater,
      removeFromWatchLater,
      isInWatchLater,
    }),
    [
      ratings,
      watchLater,
      loading,
      syncError,
      rateMovie,
      addToWatchLater,
      removeFromWatchLater,
      isInWatchLater,
    ]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
