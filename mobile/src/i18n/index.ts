import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import tr from './tr';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v3',
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
