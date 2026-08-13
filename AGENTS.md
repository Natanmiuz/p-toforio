# AGENTS.md

Sitio estático (Astro 7) de una sola página para el creador Natanohj. Build con Astro: no hay tests ni lint.

## Ejecutar localmente
- `npm install` (primera vez)
- `npm run dev` — dev server
- `npm run build` — ejecuta `npm run check` (valida traducciones) y genera `dist/`
- `npm run preview` — sirve `dist/`
- No hay tests ni lint. Validar manualmente tras cada cambio.

## Internacionalización (build-time con Astro i18n)
- Páginas estáticas por idioma: `/` = en (default, `prefixDefaultLocale: false`), `/es/`, `/ja/`. `src/pages/[locale]/index.astro` genera es/ja; `src/pages/index.astro` sirve la raíz en en.
- Traducciones en `src/i18n/lang/{en,es,ja}.json`, keys de notación de puntos (p. ej. `"nav.home"`), importadas en build (module `src/i18n/index.ts` exporta `translations`, `locales`, `defaultLocale`, `type Translation`). `public/lang/` ya no existe.
- Al añadir/editar texto: tocar SIEMPRE los tres archivos con la misma key; `npm run check` (node `scripts/check-i18n.mjs`) valida conjuntos de keys idénticos y valores no vacíos, y `npm run build` lo ejecuta antes de compilar — un key rota rompe el build.
- Los componentes reciben `t` como prop (`interface Props { t: Translation }`) e interpolan `{t['key']}` en server; no hay `data-translate` ni swap en cliente.
- Selector de idioma (`#language-switcher` en `Header.astro`): navega a `/`, `/es/` o `/ja/`; sin localStorage ni detección de navegador. El `<option>` seleccionado refleja el locale actual.
- SEO por idioma en `Layout.astro`: `<html lang>`, keys `seo.*` (title, description, ogTitle, ogDescription), hreflang + x-default y canonical literales sobre `https://natandev.com`.
- Formulario de contacto: `#submitForm` es un placeholder — `alert` con la key `form.comingSoon` de la página actual vía `define:vars`. Envío real no implementado.

## Tema
- Toggle añade/quita `dark-mode` en `body` y persiste en `localStorage['theme']`.
- Variables en `:root` de `src/styles/style.css`; overrides del modo oscuro en `src/styles/dark-mode.css`.

## Estructura y contratos
- Página única por idioma: `src/pages/index.astro` (en) y `src/pages/[locale]/index.astro` (es/ja) componen `src/components/` (Header, Hero, ContentCreator, Programmer, Contact, Footer) sobre `src/layouts/Layout.astro`.
- Navegación por anclas: `#hero`, `#content-creator`, `#programmer`, `#contact`.
- JS vanilla bundlado por Astro desde `src/scripts/` (aos-init, nav, theme).
- CDNs sin tocar en `Layout.astro`: AOS (inicializado en `src/scripts/aos-init.js`), Font Awesome, Google Fonts, script AOS clásico al final del body. No romper dependencias CDN; mantener rutas relativas.
- Formulario de contacto: `#submitForm` es un placeholder — `alert()` de `form.comingSoon` de la página actual (script con `define:vars` en `Contact.astro`). Envío real no está implementado.
- Video embebido de YouTube en `src/components/ContentCreator.astro`; no tocar sin motivo.
- Redes sin URL (Facebook, Twitch, Kick) son `a` sin `href` con `.disabled` y `aria-disabled="true"`.

Instrucciones más detalladas del repo: `.github/copilot-instructions.md`.