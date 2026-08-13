import en from './lang/en.json';
import es from './lang/es.json';
import ja from './lang/ja.json';

export const locales = ['en', 'es', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export type Translation = typeof en;

export const translations: Record<Locale, Translation> = { en, es, ja };