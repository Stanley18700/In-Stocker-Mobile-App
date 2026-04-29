import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import my from './locales/my.json';

const resources = {
  en: { translation: en },
  my: { translation: my },
};

// Initialize i18next
void i18n
  .use(initReactI18next)
  .init({
    resources,
    // By default try to load from async storage or fallback to 'en'
    // but the store hydration will properly set it later
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
    compatibilityJSON: 'v4', // Needed for formatting features in react-native
  });

export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
};

export default i18n;
