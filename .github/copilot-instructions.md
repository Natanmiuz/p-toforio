## Contexto rápido

Sitio estático (Astro 7) de una sola página para el creador Natanohj, con páginas por idioma generadas en build-time, modo oscuro y pequeñas interacciones. Los archivos relevantes están en `src/pages/`, `src/components/`, `src/layouts/`, `src/scripts/`, `src/styles/`, `src/i18n/`. Ver `AGENTS.md` para el contrato completo.

## Objetivo para un agente de codificación

- Entregar cambios pequeños y seguros (traducciones, ajustes CSS, comportamiento JS). Evitar refactorings masivos sin verificación manual (no hay tests ni lint).
- Priorizar: mantener rutas relativas, no romper dependencias CDN incluidas en `Layout.astro` (AOS, Font Awesome, Google Fonts), no tocar `src/scripts/{nav,theme,aos-init}.js` sin motivo.

## Patrón arquitectónico y decisiones visibles

- Estructura: página única con navegación por anclas (`#hero`, `#content-creator`, `#programmer`, `#contact`), servida en 3 variantes de idioma: `/` (en), `/es/`, `/ja/`. La raíz la sirve `src/pages/index.astro`; el resto lo genera `src/pages/[locale]/index.astro` con `getStaticPaths()` (excluye el `defaultLocale`).
- Traducción: JSON en `src/i18n/lang/{en,es,ja}.json` importados en build; los componentes reciben `t` (type `Translation`) y usan `{t['key']}` (keys de puntos, p. ej. `t['nav.home']`). NO usar `data-translate` ni fetch — el sistema cliente-side fue eliminado.
- Validación: `npm run check` (node `scripts/check-i18n.mjs`) verifica keys idénticas entre los 3 JSON y valores no vacíos; `npm run build` lo ejecuta primero. Si falla, el build no arranca.
- Tema: toggle añade/quita `dark-mode` en `body` y persiste en `localStorage['theme']` (`src/scripts/theme.js`).
- Animaciones/UX: AOS inicializado en `src/scripts/aos-init.js` (cargado por CDN en `Layout.astro`).

## Contrato corto para cambios (inputs / outputs / errores)

- Inputs: modificar `src/i18n/lang/*.json` (tocar SIEMPRE los 3) y/o componentes/scripts.
- Outputs esperados: textos traducidos en cada ruta de idioma, persistencia de tema, navegación fluida.
- Errores comunes: key faltante en un JSON (rompe `npm run check`), valor vacío (ídem), selector navegando a ruta inexistente (revisar `prefixDefaultLocale`).

## Patrones y ejemplos específicos

- Añadir traducción: añadir la key a `src/i18n/lang/en.json`, `es.json` y `ja.json` (misma key) y usar `{t['key']}` en el componente (prop `t` ya pasada). Ejemplo: `t['nav.home']` corresponde a `"nav.home"` en los JSON.
- Placeholder vs texto: `placeholder={t['form.placeholders.name']}` en inputs; contenido textual interpolado.
- Contact form: el botón `#submitForm` muestra `alert(t['form.comingSoon'])` vía `define:vars` en el script de `Contact.astro`; para envío real, editar ese script.
- Idiomas: `en`, `es`, `ja`; raíz `/` es `en`. Añadir/eliminar idiomas requiere editar `astro.config.mjs` (bloque `i18n`) y `getStaticPaths` — `npm run check` exige paridad de keys entre todos los JSON.
- SEO por idioma: `Layout.astro` recibe `locale` y `t`; `<html lang>`, title/description/OG desde keys `seo.*`, hreflang + x-default y canonical literales sobre `https://natandev.com`. `@astrojs/sitemap` genera `sitemap-index.xml` con las URLs de los 3 idiomas.

## Cómo ejecutar y depurar localmente

- `npm install` (primera vez), `npm run dev` para desarrollo, `npm run build` (incluye `check`) y `npm run preview`. Sin tests: validar manualmente con DevTools (Network/Console) las rutas `/`, `/es/`, `/ja/`.

## Integraciones y dependencias externas

- CDN: AOS (`cdn.jsdelivr.net`), Font Awesome (`cdnjs.cloudflare.com`), Google Fonts. Embeds: iframe de YouTube en `ContentCreator.astro`; no tocar sin validar.
- `@astrojs/sitemap` genera `sitemap-index.xml` con las URLs de los 3 idiomas.

## Reglas de estilo y convenciones del proyecto

- Keys en notación de puntos (p. ej. `programmer.projects.imageResizer`); tipado `Translation = typeof en` en `src/i18n/index.ts`.
- CSS: variables en `src/styles/style.css` (tema claro) y overrides en `src/styles/dark-mode.css`; para apariencia principal editar `:root` en `style.css`.

## Tareas típicas y dónde editarlas

- Añadir/editar texto traducible: los 3 JSON en `src/i18n/lang/` + uso de `{t['key']}` en el componente.
- Cambiar comportamiento del formulario de contacto: script de `Contact.astro` (buscar `#submitForm`).
- Ajustes visuales y responsive: `src/styles/style.css` y `src/styles/dark-mode.css`.

## Notas importantes / advertencias

- `npm run build` falla si los JSON de idioma tienen keys distintas o valores vacíos (a propósito): arreglar los JSON antes de desplegar.
- No existen `public/lang/` ni `src/scripts/i18n.js` en el sistema actual; cualquier referencia a `data-translate`, `localStorage.language` o `fetch('lang/...')` es obsoleto.