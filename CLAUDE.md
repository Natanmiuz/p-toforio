# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Sitio estático de una sola página (Astro 7, sin framework de UI) para el creador Natanohj, en tres idiomas: en, es y ja.

## Comandos

- `npm install`: instala dependencias (la primera vez).
- `npm run dev`: dev server.
- `npm run check`: valida traducciones con `scripts/check-i18n.mjs`.
- `npm run build`: ejecuta `check` y, si pasa, `astro build` hacia `dist/`. Una traducción mal hecha rompe el build.
- `npm run preview`: sirve `dist/`.

No hay tests, lint ni typecheck en los scripts. Valida a mano las rutas `/`, `/es/` y `/ja/` después de cada cambio. `testsprite_tests/` y `docs/` están en `.gitignore` y describen el sistema i18n anterior, que se ejecutaba en el cliente (localStorage `language`, fetch de `lang/*.json`). No los uses como suite de tests ni como referencia del comportamiento actual.

## Ramas: `develop` y `main` divergen en el deploy

`main` tiene cambios que nunca se fusionaron de vuelta en `develop`:

- `astro.config.mjs` con `site: 'https://Natanmiuz.github.io'` y `base: '/p-toforio/'`.
- `.github/workflows/deploy.yml`: build y deploy a GitHub Pages con cada push a `main`.
- En `Layout.astro` y `Header.astro`, las URLs se construyen con `import.meta.env.BASE_URL` y `BASE = 'https://Natanmiuz.github.io/p-toforio'`.

`develop` sigue con `site: 'https://natandev.com'`, sin `base`, con rutas absolutas `/...` y con `.github/copilot-instructions.md`, que `main` borró. `AGENTS.md` está en `.gitignore` (solo existe en local) y describe el estado de `main`. Antes de tocar `astro.config.mjs`, `Layout.astro` o `Header.astro`, revisa `git diff develop origin/main`. Cualquier URL nueva de assets o de navegación tiene que funcionar bajo el subpath `/p-toforio/`.

## Arquitectura

### i18n en tiempo de build

- `src/pages/index.astro` genera `/` (en, `defaultLocale`). `src/pages/[locale]/index.astro` genera `/es/` y `/ja/` con `getStaticPaths()`, excluyendo el idioma por defecto. Las dos páginas repiten la misma composición de componentes: una sección nueva hay que añadirla en **ambas**.
- `src/i18n/index.ts` importa `src/i18n/lang/{en,es,ja}.json` y exporta `translations`, `locales`, `defaultLocale` y `Translation = typeof en`. `en.json` es la fuente del tipo.
- Los JSON son **planos**: la key es literalmente `"nav.home"`, no un objeto anidado. `check-i18n` exige el mismo conjunto de keys en los tres archivos y que cada valor sea un string no vacío.
- Cada componente recibe `t` como prop (`interface Props { t: Translation }`) e interpola `{t['key']}` en el servidor. No hay traducción en el cliente.
- Para añadir o quitar un idioma hay que tocar varios archivos a mano:
  - `astro.config.mjs`: `i18n.locales` y los locales de `sitemap`.
  - `src/i18n/index.ts`: el import, el array `locales` y el objeto `translations`.
  - `scripts/check-i18n.mjs`: el array `files`, que está hardcodeado.
  - `Layout.astro`: los mapas `paths`, `ogLocales` y `hreflangs`.
  - Las `<option>` de `#language-switcher` en `Header.astro`.

### Layout, SEO y scripts

- `src/layouts/Layout.astro` contiene `<html lang>`, title, description y OG (desde las keys `seo.*`), canonical, hreflang con x-default, y el JSON-LD `Person`. La URL del sitio está escrita a mano en la constante `BASE` y repite el `site` de `astro.config.mjs`: mantén ambas iguales. `@astrojs/sitemap` genera `sitemap-index.xml`.
- Los CDN viven en `Layout.astro`: Google Fonts, Font Awesome 6.5.1 y AOS 2.3.4 (el CSS en `<head>` y el JS con `is:inline` al final del `body`). No los quites.
- Astro bundlea `src/scripts/{aos-init,nav,theme}.js` como módulos diferidos, así que `AOS` ya existe como global cuando corre `aos-init.js`.
- Scripts dentro de componentes:
  - `Header.astro` tiene un script bundlado que, al cambiar de idioma, navega a la ruta del locale. No usa localStorage ni detecta el idioma del navegador.
  - `Contact.astro` usa `define:vars`, que convierte el script en inline. Así pasa `form.comingSoon` a un `alert`. El botón `#submitForm` es un placeholder: el formulario no envía nada.
- Tema: `theme.js` añade o quita la clase `dark-mode` en `body` y la guarda en `localStorage['theme']`. Las variables CSS están en `:root` de `src/styles/style.css` y los overrides oscuros en `src/styles/dark-mode.css`. `Layout.astro` importa los dos archivos.
- Navegación por anclas (`#hero`, `#content-creator`, `#programmer`, `#contact`). El scrollspy de `nav.js` usa el `id` de cada `<section>`.

### Datos duplicados

Los enlaces a redes sociales están escritos a mano en tres sitios que deben ir sincronizados:

- `ContentCreator.astro`
- `Footer.astro`
- El `sameAs` del JSON-LD en `Layout.astro`

Ahora mismo no coinciden: Facebook está activo en `ContentCreator.astro`, deshabilitado en `Footer.astro` y no aparece en `sameAs`. Una red sin URL se marca con un `<a>` sin `href`, la clase `.disabled` y `aria-disabled="true"`. El embed de YouTube de `ContentCreator.astro` usa una URL `/embed/<id>`.
