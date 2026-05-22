/**
 * RTLContext — Global RTL state for the entire app.
 *
 * When Arabic (ar) or Kurdish (ku) is selected:
 *   - isRTL = true
 *   - App.tsx root View gets direction: 'rtl'
 *   - ALL children cascade: flex direction, textAlign, padding, icons etc.
 *
 * Bridge pattern: on mount, registers setLanguage into i18n module so
 * changeLanguage() calls from any screen trigger RTL re-render globally.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { registerRTLSetter } from '../i18n';

const RTL_LANGS = new Set(['ar', 'ku']);

interface RTLContextValue {
  isRTL: boolean;
  setLanguage: (langCode: string) => void;
}

const RTLContext = createContext<RTLContextValue>({
  isRTL: false,
  setLanguage: () => {},
});

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const [isRTL, setIsRTL] = useState<boolean>(false);

  const setLanguage = useCallback((langCode: string) => {
    const rtl = RTL_LANGS.has(langCode.slice(0, 2).toLowerCase());
    setIsRTL(rtl);
    I18nManager.forceRTL(rtl);
  }, []);

  // Register this setter as the bridge so i18n module can call it
  useEffect(() => {
    registerRTLSetter(setLanguage);
    return () => registerRTLSetter(() => {});
  }, [setLanguage]);

  return (
    <RTLContext.Provider value={{ isRTL, setLanguage }}>
      {children}
    </RTLContext.Provider>
  );
}

export const useRTL = () => useContext(RTLContext);
