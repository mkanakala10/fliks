import { createContext, useContext } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children, onNavigate, onToggleNav, onGoBack }) {
  return (
    <NavigationContext.Provider value={{ onNavigate, onToggleNav, onGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
