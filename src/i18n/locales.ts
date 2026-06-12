export const locales = [
  'en', 'ar', 'bn', 'fr', 'de', 'es', 'id', 'it', 
  'ja', 'ko', 'ms', 'nl', 'pl', 'pt', 'ru', 'sv', 
  'sw', 'th', 'tr', 'ur', 'uz', 'zh'
] as const;

export type Locale = typeof locales[number];
export const defaultLocale = 'en' as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  bn: 'বাংলা',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  sv: 'Svenska',
  sw: 'Kiswahili',
  th: 'ไทย',
  tr: 'Türkçe',
  ur: 'اردو',
  uz: 'O\'zbek',
  zh: '中文',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr', ar: 'rtl', bn: 'ltr', fr: 'ltr', de: 'ltr',
  es: 'ltr', id: 'ltr', it: 'ltr', ja: 'ltr', ko: 'ltr',
  ms: 'ltr', nl: 'ltr', pl: 'ltr', pt: 'ltr', ru: 'ltr',
  sv: 'ltr', sw: 'ltr', th: 'ltr', tr: 'ltr', ur: 'rtl',
  uz: 'ltr', zh: 'ltr',
};
