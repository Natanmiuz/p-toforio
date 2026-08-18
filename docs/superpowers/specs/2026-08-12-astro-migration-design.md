# Migración a Astro — Diseño

Fecha: 2026-08-12
Estado: aprobado por el usuario

## Objetivo

Migrar el sitio estático de una sola página (HTML/CSS/JS vanilla) de Natanohj a Astro, manteniendo paridad visual y de comportamiento, y aprovechando la migración para corregir deudas técnicas conocidas. Sin framework JS adicional. Sin cambios de UI.

## Alcance / No-objetivos

- NO se migra el i18n a rutas (`/en/`, `/es/`, `/ja/`). La traducción sigue siendo cliente-side con `public/lang/*.json` y `data-translate`.
- NO se implementa el envío real del formulario de contacto (sigue mostrando el alert `form.comingSoon`).
- NO se tocan las dependencias CDN (AOS 2.3.4, Font Awesome 6.5.1, Google Fonts Poppins).
- NO se añade CI/deploy (el sitio no está publicado aún).
- NO se añade ningún framework UI (React/Vue/Svelte).

## Stack y configuración

- Astro 7.x (instalado: `astro@7.2.1`; requiere Node >=22.12 — local: Node v26.1.0).
- Output estático (default de Astro), sin `base`.
- `site: 'https://natandev.com'` en `astro.config.mjs`.
- Scripts npm: `dev`, `build`, `preview`.
- `tsconfig.json` con `astro/tsconfigs/base`.

## Estructura de archivos

```
astro.config.mjs
package.json
tsconfig.json
src/
  layouts/Layout.astro
  components/Header.astro
  components/Hero.astro
  components/ContentCreator.astro
  components/Programmer.astro
  components/Contact.astro
  components/Footer.astro
  pages/index.astro
  scripts/nav.js
  scripts/theme.js
  scripts/i18n.js
  styles/style.css        (copia de css/style.css)
  styles/dark-mode.css    (copia de css/dark-mode.css)
public/
  lang/en.json  lang/es.json  lang/ja.json
  assets/images/favi.ico
```

Se eliminan las carpetas raíz `css/` y `js/` una vez migrado el contenido a `src/`.

## Layout.astro

- Contiene el `<head>` de `index.html` palabra por palabra: charset, viewport, meta SEO, Open Graph, Twitter Card, favicon, canonical, preconnects, Google Fonts, Font Awesome CDN, AOS CSS CDN, y el JSON-LD de Schema.org Person.
- Se elimina el meta `apple-touch-icon` (apunta a `assets/images/apple-touch-icon.png`, archivo inexistente).
- `<body>` con el skip-link, `<slot />` y el `<script>` clásico CDN de AOS (`https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js`).
- Importa `../styles/style.css`, `../styles/dark-mode.css`, y los módulos de `src/scripts/` (bundled por Astro, ejecución diferida → sin race con el CDN clásico de AOS).

## Componentes

- `Header.astro` — navbar existente: logo, `nav-menu` (#hero, #content-creator, #programmer, #contact), `#language-switcher`, `#theme-toggle`, hamburguesa. Todo el markup, atributos `data-translate` y `data-aos` idénticos al original.
- `Hero.astro` — shapes, `home.title`/`home.subtitle` con AOS, botones.
- `ContentCreator.astro` — iframe de YouTube (id `1g3joMapdIY`, intacto), `social-links` (TikTok, YouTube, Facebook, Twitter/X, Instagram, Twitch, Kick).
- `Programmer.astro` — descripción, lista de proyectos (image-resizer, AudioConvert, VideoConvert), enlace a GitHub.
- `Contact.astro` — información de contacto + formulario placeholder con `#submitForm` (mismo comportamiento).
- `Footer.astro` — about (texto restaurado, ver Arreglos), quick links, redes sociales, copyright con año dinámico.
- `index.astro` — compone `<Layout>` + los 6 componentes.

## JS: división de script.js

`src/scripts/*.js` se importan desde `Layout.astro`; Astro los bundlea en un solo archivo.

- `nav.js` — toggle hamburguesa, cierre del menú al pulsar un enlace, clase `scrolled` en navbar al hacer scroll, scrollspy (`active` en `.nav-link` según sección visible).
- `theme.js` — toggle `dark-mode` en `body`, swap icono `fa-moon`/`fa-sun`, persistencia en `localStorage['theme']`.
- `i18n.js` — `getBrowserLanguage()`, `applyTranslations()` (data-translate + data-translate-placeholder), `loadTranslations()` con fallback a `en` y resync del switcher, inicialización del switcher, handler del form (fetch de `form.comingSoon` + `alert`).
- `AOS.init({...})` con la misma configuración (duration 800, easing 'ease', once, offset 100) en un módulo `src/scripts/` propio.

## Arreglos de deuda técnica

1. `home.title`: se añade `"home.title": "Natanohj"` a `en.json`, `es.json` y `ja.json`.
2. Redes sin URL (Facebook, Twitch, Kick en hero y footer): `<a>` sin `href`, `aria-disabled="true"`, clase `.disabled`; CSS nuevo en `style.css`: opacidad reducida, `cursor: not-allowed`, sin transformaciones ni colores de hover. Se aplica a `.social-link.disabled` y `.footer-social-link.disabled`.
3. `footer.aboutText`: se restaura «Programmer by day, content creator by night…» en los 3 idiomas (se traduce es/ja).
4. Copyright dinámico: en `Footer.astro`, `© {new Date().getFullYear()}` + `<span data-translate="footer.copyright">`; los JSON pasan `footer.copyright` sin año («Natan. All rights reserved.» en en, traducción en es/ja).
5. Se elimina el meta `apple-touch-icon` roto.
6. `AGENTS.md` se actualiza: ahora hay toolchain (`npm install`, `npm run dev`, `npm run build`); el resto de contratos (i18n, tema, estructura de secciones) se mantienen.

## Manejo de errores

- El fallback a `en` de `loadTranslations` se conserva tal cual (copy del comportamiento actual).
- Si `npm run build` falla, el plan de implementación debe contener pasos de verificación incremental (dev server + console) para aislar el error.
- Sin test harness en el repo: validación manual.

## Verificación

Checklist manual tras la implementación:

1. `npm run build` exitoso; `npm run preview` carga el sitio.
2. `dist/` contiene `lang/` (los 3 JSON) y `assets/images/favi.ico`.
3. Traducciones: switcher cambia en/es/ja, `localStorage.language` persiste, fallback a `en` si el fetch falla.
4. Tema: toggle funciona, persiste, icono coherente.
5. Navegación: hamburguesa (viewport móvil), scrollspy, navbar `scrolled`.
6. AOS anima al hacer scroll; sin errores de consola.
7. Form: alert «coming soon» en el idioma seleccionado.
8. Enlaces disabled: se ven atenuados, sin cursor pointer, sin navegación.
9. Footer: texto de about restaurado, año de copyright actual.

## Decisiones registradas

- Enfoque elegido: Astro vanilla con reescritura en componentes (Enfoque 1 de la propuesta).
- El i18n queda en `public/` (fetch runtime) en lugar de inyectarse en build: preserva el contrato actual de AGENTS.md y minimiza riesgo.
- Los JSON de idioma se mantienen 1:1 (solo se añaden/editan las keys de los arreglos).