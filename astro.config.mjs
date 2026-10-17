import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import i18n from './src/i18n/locales.json' with { type: 'json' };

const codes = i18n.locales.map((locale) => locale.code);

export default defineConfig({
  site: 'https://natanmiuz.github.io',
  base: '/p-toforio/',
  i18n: {
    locales: codes,
    defaultLocale: i18n.default,
    routing: { prefixDefaultLocale: false }
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: i18n.default,
        locales: Object.fromEntries(codes.map((code) => [code, code]))
      }
    })
  ]
});
