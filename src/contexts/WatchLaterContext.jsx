import { useUserData } from './UserDataContext';

/** @deprecated Prefer useUserData — kept for existing imports */
export function WatchLaterProvider({ children }) {
  return children;
}

export function useWatchLater() {
  const { watchLater, addToWatchLater, removeFromWatchLater, isInWatchLater } = useUserData();
  return { watchLater, addToWatchLater, removeFromWatchLater, isInWatchLater };
}
