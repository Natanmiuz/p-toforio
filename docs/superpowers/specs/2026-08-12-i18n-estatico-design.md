# i18n estático con Astro — Diseño

Fecha: 2026-08-12
Estado: aprobado por el usuario

## Objetivo

Reemplazar el sistema de traducción cliente-side (fetch runtime de `public/lang/*.json` + swap de DOM vía `data-translate`) por páginas estáticas por idioma generadas en build-time con el i18n nativo de Astro. Metas: SEO real por idioma, cero parpadeo (FOUC), y mantenibilidad con validación automática de keys. Sin cambio de UI.

## Alcance / No-objetivos

- NO se cambia la estructura visual ni el contenido de las secciones (solo el mecanismo de traducción).
- NO se implementa el envío real del formulario (sigue el alert `form.comingSoon`, ahora con la traducción de la página).
- NO se tocan las dependencias CDN (AOS, Font Awesome, Google Fonts) ni los scripts `nav.js`/`theme.js`/`aos-init.js`.
- NO se añade redirección automática por idioma del navegador ni memoria en `localStorage`.
- NO se añade CI/deploy.

## Stack y configuración

- Astro 7.x (instalado: `astro@7.2.1`), output estático.
- `site: 'https://natandev.com'` se mantiene en `astro.config.mjs`.
- Nuevo bloque `i18n` en `astro.config.mjs`:

```js
i18n: {
  locales: ['en', 'es', 'ja'],
  defaultLocale: 'en',
  routing: { prefixDefaultLocale: false }
}
```

`prefixDefaultLocale: false` → la raíz `/` es inglés; `/es/` y `/ja/` para el resto.

- Nueva dependencia: `@astrojs/sitemap` (integration `sitemap()` en el config) → sitemap-index con las URLs de los 3 idiomas.

## Estructura de archivos

```
src/
  i18n/
    lang/en.json  lang/es.json  lang/ja.json   (movidos desde public/lang/)
    index.ts                                      (módulo de traducciones)
  pages/[locale]/index.astro                       (antes pages/index.astro)
  layouts/Layout.astro                             (ahora recibe locale y t)
  components/*.astro                               (reciben t como prop)
scripts/check-i18n.mjs                             (nuevo)
public/lang/                                       (se elimina)
src/scripts/i18n.js                                (se elimina)
```

## Módulo de traducciones (`src/i18n/index.ts`)

```ts
import en from './lang/en.json';
import es from './lang/es.json';
import ja from './lang/ja.json';

export type Translation = typeof en;
export const translations: Record<string, Translation> = { en, es, ja };
export const locales = ['en', 'es', 'ja'] as const;
```

- Los JSON son planos (keys con puntos literales, p. ej. `"nav.home"`), importados en build-time; el fetch runtime desaparece.
- `Translation = typeof en` da tipado de keys: un typo de key en un componente falla en el editor.

## Página `src/pages/[locale]/index.astro`

- `getStaticPaths()` devuelve `{ params: { locale: 'en' } }`, `'es'`, `'ja'`.
- `const t = translations[Astro.params.locale] ?? translations.en;`
- Astro emite `/index.html` (en, sin prefijo) y `/es/index.html`, `/ja/index.html`.
- Compone `<Layout locale={locale} t={t}>` + los 6 componentes, cada uno con `t`.

## Componentes

Patrón común en todos (Header, Hero, ContentCreator, Programmer, Contact, Footer):

```astro
---
interface Props { t: Translation }
const { t } = Astro.props;
---
<p>{t['home.subtitle']}</p>
<input placeholder={t['form.placeholders.name']}>
```

- Se eliminan todos los atributos `data-translate` y `data-translate-placeholder`; el texto se interpola en build.
- Los `<option>` del selector usan `t['languages.english']` etc. (nombres nativos, como hoy).

### Selector de idioma (`Header.astro`)

Script pequeño (bundled por Astro):

```js
document.getElementById('language-switcher').addEventListener('change', (e) => {
  const v = e.target.value;
  location.href = v === 'en' ? '/' : '/' + v + '/';
});
```

Sin localStorage ni detección de navegador.

### Formulario (`Contact.astro`)

Se conserva el handler de `#submitForm` (preventDefault + `alert`) usando `define:vars={{ comingSoon: t['form.comingSoon'] }}` y `alert(comingSoon)`. Se elimina el fallback hardcodeado en inglés y el fetch.

## SEO por idioma (`Layout.astro`)

Recibe `locale` y `t` como props:

- `<html lang={locale}>`.
- Nuevas keys en los 3 JSON: `seo.title`, `seo.description`, `seo.ogTitle`, `seo.ogDescription` — `<title>`, `<meta name="description">`, `og:title`, `og:description` se interpolan con `t[...]`.
- `<link rel="alternate" hreflang="en|es|ja">` para las 3 variantes + `hreflang="x-default"` → `/`.
- Canonical por idioma: `/`, `/es/`, `/ja/` (absolutos con `https://natandev.com`).
- `og:url` y `og:locale` (`en_US`, `es_ES`, `ja_JP`) por página.
- `twitter:*`, keywords, favicon, JSON-LD y preconnects se mantienen estáticos.
- Se usa `getRelativeLocaleUrl` de `astro:i18n` para las URLs hreflang/canonical cuando aporte; si no, literales.

## Validación de keys (`scripts/check-i18n.mjs`)

- Lee `src/i18n/lang/{en,es,ja}.json`, comprueba que los conjuntos de keys sean idénticos y que no haya valores vacíos (`""`).
- Sale con código != 0 si falla (mensaje con las keys faltantes/sobrantes).
- En `package.json`:

```json
"check": "node scripts/check-i18n.mjs",
"build": "npm run check && astro build"
```

## Contenido

- Arreglar `ja.json` `contact.email`: `"いつ"` (rota) → traducción completa, p. ej. `"いつでもメールを送ってください"`.
- Corregir `ja.json` `home.subtitle` (`"私が叶える夢。"` es infiel al original) → `"私は作り、創造し、自分の世界を共有します。"`.
- Añadir las keys `seo.*` a los 3 JSON con traducciones de título/descripción/OG.

## Docs del repo

- Actualizar `AGENTS.md`: sustituir la sección de internacionalización (fetch runtime, `data-translate`, localStorage) por el nuevo contrato: build-time, `src/i18n/lang/`, módulo `src/i18n/index.ts`, selector navega a `/es/`/`/ja/`, flujo «tocar siempre los 3 JSON + `npm run check`», y `public/lang/` ya no existe.
- Revisar `.github/copilot-instructions.md` por referencias al sistema viejo y actualizarlas.

## Manejo de errores

- Colchón de seguridad: `translations[locale] ?? translations.en` (cubre cualquier locale fuera de rango aunque no se genere página).
- Un locale no soportado en la URL → 404 estático (no hay fallback de redirección por diseño).
- Si falla `npm run check`, el build no arranca: el fallo es explícito y con mensaje de las keys implicadas.
- Sin test harness: validación manual (ver más abajo).

## Verificación

Checklist manual tras la implementación:

1. `npm run check` pasa; `npm run build` exitoso; `dist/` contiene `index.html`, `es/index.html`, `ja/index.html`, ausencia de `lang/` y de `i18n.js`.
2. `npm run dev`: `/`, `/es/`, `/ja/` — `<html lang>` correcto, texto servido ya traducido (sin fetch en la pestaña Network, sin parpadeo).
3. Selector: en `/` al cambiar a es/ja navega a `/es/`/`/ja/`; en `/es/` cambiar a en vuelve a `/`.
4. `<title>`, meta description, OG y hreflang/canonical correctos por idioma (inspección del HTML servido).
5. Form: alert «coming soon» en el idioma de la página actual.
6. Tema y navegación: sin regresiones (toggle, hamburguesa, scrollspy, AOS, sin errores de consola).
7. Sitemap: `sitemap-index.xml` con las URLs de los 3 idiomas.

## Decisiones registradas

- Enfoque elegido: páginas estáticas por idioma con i18n nativo de Astro (Enfoque A de la propuesta).
- Raíz = `en` con `prefixDefaultLocale: false` (URLs cortas; decisión del usuario).
- El selector solo navega; sin autodetección ni memoria en `localStorage` (decisión del usuario).
- El i18n deja `public/` y pasa a `src/i18n/` (imports en build-time; el fetch desaparece).
- Se añade `@astrojs/sitemap` como acompañante SEO (aprobado en revisión de diseño).
- Este spec sustituye la parte de i18n de `2026-08-12-astro-migration-design.md` (que dejaba el i18n en cliente).