import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://Natanmiuz.github.io',
  base: '/p-toforio/',
  i18n: {
    locales: ['en', 'es', 'ja'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false }
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', es: 'es-ES', ja: 'ja-JP' }
      }
    })
  ]
});
