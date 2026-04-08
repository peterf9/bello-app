import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './utils/translations';

// Extract resources from the existing custom translations utility
const resources = {
  en: {
    translation: translations.en,
  },
  pt: {
    translation: translations.pt,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // Default to Brazilian Portuguese as requested
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
