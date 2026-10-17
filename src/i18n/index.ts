import config from './locales.json';
import type en from './lang/en.json';

// locales.json is the single list of languages: astro.config.mjs,
// scripts/check-i18n.mjs and the pages all read it.
export type Translation = typeof en;
export type Locale = string;

export interface LocaleInfo {
  code: Locale;
  name: string;
  og: string;
}

export const localeInfo: LocaleInfo[] = config.locales;
export const locales: Locale[] = localeInfo.map((locale) => locale.code);
export const defaultLocale: Locale = config.default;

const files = import.meta.glob<Translation>('./lang/*.json', { eager: true, import: 'default' });

export const translations: Record<Locale, Translation> = Object.fromEntries(
  locales.map((code) => [code, files[`./lang/${code}.json`]])
);

/** Path of a locale's page relative to the site base: '' for the default, 'es/' for the rest. */
export const localePath = (code: Locale) => (code === defaultLocale ? '' : `${code}/`);
