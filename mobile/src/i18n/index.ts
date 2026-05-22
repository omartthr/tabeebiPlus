import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import en from './en';
import tr from './tr';
import ar from './ar';
import ku from './ku';

// RTL / LTR language sets
export const RTL_LANGUAGES = ['ar', 'ku'];
export const LTR_LANGUAGES = ['en', 'tr'];

export const ALL_LANGUAGES = [
  { code: 'en', label: 'English',  nativeLabel: 'English',  rtl: false, flag: '🇬🇧' },
  { code: 'tr', label: 'Turkish',  nativeLabel: 'Türkçe',   rtl: false, flag: '🇹🇷' },
  { code: 'ar', label: 'Arabic',   nativeLabel: 'العربية',  rtl: true,  flag: '🇮🇶' },
  { code: 'ku', label: 'Kurdish',  nativeLabel: 'کوردی',    rtl: true,  flag: '🏴' },
];

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  ar: { translation: ar },
  ku: { translation: ku },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  } as any);

/**
 * A bridge callback so the RTLProvider (React world) can be notified
 * when changeLanguage() is called from anywhere (WelcomeScreen, ProfileScreen etc.).
 */
let _rtlSetter: ((langCode: string) => void) | null = null;

export function registerRTLSetter(fn: (langCode: string) => void) {
  _rtlSetter = fn;
}

/**
 * Call this instead of i18n.changeLanguage() everywhere.
 * It changes the i18next language AND notifies the RTL context.
 */
export const changeLanguage = async (langCode: string) => {
  const isRTL = RTL_LANGUAGES.includes(langCode.slice(0, 2));

  // Update native I18nManager hint
  I18nManager.forceRTL(isRTL);

  // Notify React RTL context (triggers root direction: 'rtl'/'ltr' re-render)
  _rtlSetter?.(langCode);

  // Change i18next language (triggers all t() re-renders)
  await i18n.changeLanguage(langCode);
};

export const isCurrentRTL = () => RTL_LANGUAGES.includes((i18n.language || 'en').slice(0, 2));

export default i18n;
