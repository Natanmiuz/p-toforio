# AGENTS.md

Sitio estático (Astro 7) de una sola página para el creador Natanohj. Build con Astro: no hay tests ni lint.

## Ejecutar localmente
- `npm install` (primera vez)
- `npm run dev` — dev server (los `fetch('lang/<lang>.json')` fallan con `file://`, servir siempre por HTTP)
- `npm run build` — genera `dist/`
- `npm run preview` — sirve `dist/`
- No hay comandos de verificación (test/lint). Validar manualmente tras cada cambio.

## Internacionalización (cliente-lado)
- Traducciones en `public/lang/{en,es,ja}.json` con keys de notación de puntos (p. ej. `"nav.home"`). La ruta del fetch runtime es `lang/<lang>.json` (desde la raíz de `dist/`).
- Al añadir/editar texto: tocar SIEMPRE los tres archivos y usar la misma key que en `index.astro`/componentes (`data-translate` para texto, `data-translate-placeholder` para atributos `placeholder`).
- El script solo aplica keys existentes: si una key falta en el JSON no hay error, solo se deja el HTML original. Validar manualmente.
- Lenguaje: `localStorage.language`, si no `getBrowserLanguage()`, fallback a `en` ante fetch fallido.

## Tema
- Toggle añade/quita `dark-mode` en `body` y persiste en `localStorage['theme']`.
- Variables en `:root` de `src/styles/style.css`; overrides del modo oscuro en `src/styles/dark-mode.css`.

## Estructura y contratos
- Página única: `src/pages/index.astro` compone `src/components/` (Header, Hero, ContentCreator, Programmer, Contact, Footer) sobre `src/layouts/Layout.astro`.
- Navegación por anclas: `#hero`, `#content-creator`, `#programmer`, `#contact`.
- JS vanilla bundlado por Astro desde `src/scripts/` (aos-init, nav, theme, i18n).
- CDNs sin tocar en `Layout.astro`: AOS (inicializado en `src/scripts/aos-init.js`), Font Awesome, Google Fonts, script AOS clásico al final del body. No romper dependencias CDN; mantener rutas relativas.
- Formulario de contacto: `#submitForm` es un placeholder — fetch de `form.comingSoon` y `alert()`. Envío real no está implementado.
- Video embebido de YouTube en `src/components/ContentCreator.astro`; no tocar sin motivo.
- Redes sin URL (Facebook, Twitch, Kick) son `a` sin `href` con `.disabled` y `aria-disabled="true"`.

Instrucciones más detalladas del repo: `.github/copilot-instructions.md`.