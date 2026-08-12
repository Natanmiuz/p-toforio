# Migración a Astro — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el sitio estático vanilla de Natanohj a Astro 7 con paridad de comportamiento, corrigiendo las deudas técnicas aprobadas en el spec.

**Architecture:** Reescritura del `index.html` monolítico en `Layout.astro` + 6 componentes bajo `src/components/`, CSS/JS movidos a `src/styles/` y `src/scripts/` (bundled por Astro), JSONs i18n en `public/lang/` (fetch runtime intacto), CDNs (AOS, Font Awesome, Google Fonts) sin tocar.

**Tech Stack:** Astro 7.x (estático), JS vanilla sin framework, CDNs existentes.

**Spec:** `docs/superpowers/specs/2026-08-12-astro-migration-design.md`

## Global Constraints

- Node >=22.12 (local: v26.1.0). Instalar `astro@^7.2.1` como única dependencia.
- Output estático (default). `site: 'https://natandev.com'`, sin `base`.
- NO migrar i18n a rutas; traducción cliente-side vía `public/lang/*.json` y `data-translate` (contrato de AGENTS.md intacto).
- NO tocar CDNs: AOS 2.3.4 (css+js), Font Awesome 6.5.1, Google Fonts Poppins.
- NO implementar envío real del formulario; mantener alert `form.comingSoon`.
- NO añadir framework UI ni CI/deploy.
- Cero cambios visuales; el markup de cada sección se copia del `index.html` original salvo los arreglos aprobados (éxitos: `javascript:void(0)` → disabled, año dinámico, textos footer, `home.title`, quitar meta apple-touch-icon).
- Comandos en PowerShell (win32). Validación manual en cada tarea vía `npm run build` (no hay test harness).
- Commits frecuentes con mensajes estilo repo (minúsculas, español corto).

---

### Task 1: Scaffold del proyecto Astro

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (shell temporal)

**Interfaces:**
- Produces: `npm run dev/build/preview` operativos; `dist/` generable.

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "miweb",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^7.2.1"
  }
}
```

- [ ] **Step 2: Crear `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://natandev.com'
});
```

- [ ] **Step 3: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/base",
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Crear `.gitignore`**

```
node_modules/
dist/
.astro/
npm-debug.log*
```

- [ ] **Step 5: Crear shell temporal `src/pages/index.astro`** (se sustituirá en Task 8)

```astro
---
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Astro shell</title>
  </head>
  <body>
    <h1>Migration in progress</h1>
  </body>
</html>
```

- [ ] **Step 6: Instalar dependencias**

Run: `npm install`
Expected: `node_modules/` creado, sin errores.

- [ ] **Step 7: Verificar build**

Run: `npm run build`
Expected: exit 0; `dist/index.html` generado.

- [ ] **Step 8: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro package-lock.json
git commit -m "feat: scaffold astro"
```

---

### Task 2: Migrar estilos y assets estáticos

**Files:**
- Create: `src/styles/style.css` (copia de `css/style.css`)
- Create: `src/styles/dark-mode.css` (copia de `css/dark-mode.css`)
- Create: `public/lang/en.json`, `public/lang/es.json`, `public/lang/ja.json` (copias de `lang/`)
- Create: `public/assets/images/favi.ico` (copia de `assets/images/favi.ico`)

**Interfaces:**
- Produces: rutas que consumirán `Layout.astro` (Task 4): `../styles/style.css`, `../styles/dark-mode.css`, y que el fetch runtime pedirá como `lang/<lang>.json` (misma ruta relativa que hoy porque `public/` se copia a la raíz de `dist/`).

- [ ] **Step 1: Crear directorios**

```powershell
New-Item -ItemType Directory -Path src\styles, src\scripts, public\lang, public\assets\images -Force
```

- [ ] **Step 2: Copiar CSS**

```powershell
Copy-Item css\style.css src\styles\style.css
Copy-Item css\dark-mode.css src\styles\dark-mode.css
```

- [ ] **Step 3: Copiar JSONs de idioma**

```powershell
Copy-Item lang\en.json public\lang\en.json
Copy-Item lang\es.json public\lang\es.json
Copy-Item lang\ja.json public\lang\ja.json
```

- [ ] **Step 4: Copiar favicon**

```powershell
Copy-Item assets\images\favi.ico public\assets\images\favi.ico
```

- [ ] **Step 5: Verificar copias (hashes idénticos)**

```powershell
(Get-FileHash css\style.css).Hash; (Get-FileHash src\styles\style.css).Hash
(Get-FileHash lang\en.json).Hash; (Get-FileHash public\lang\en.json).Hash
```

Expected: cada par de hashes coincide.

- [ ] **Step 6: Commit**

```bash
git add src/styles public
git commit -m "feat: migra estilos y assets a src/public"
```

---

### Task 3: Crear los 4 módulos de script

**Files:**
- Create: `src/scripts/aos-init.js`
- Create: `src/scripts/nav.js`
- Create: `src/scripts/theme.js`
- Create: `src/scripts/i18n.js`

**Interfaces:**
- Produces (consumidos por `Layout.astro` en Task 4):
  - `aos-init.js` — sin exports, llama `AOS.init(...)` (global del CDN).
  - `nav.js` — sin exports; depende de `#hamburger`, `#nav-menu`, `.nav-link`, `.navbar`.
  - `theme.js` — sin exports; depende de `#theme-toggle` y su `<i>`; lee/escribe `localStorage['theme']`.
  - `i18n.js` — sin exports; define `getBrowserLanguage()`, `loadTranslations(lang)`, `applyTranslations(translations)`; depende de `#language-switcher` y `#submitForm`; hace `fetch('lang/<lang>.json')`.

- [ ] **Step 1: Crear `src/scripts/aos-init.js`**

```js
AOS.init({
  duration: 800,
  easing: 'ease',
  once: true,
  offset: 100
});
```

- [ ] **Step 2: Crear `src/scripts/nav.js`**

```js
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= (sectionTop - 150)) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
});
```

- [ ] **Step 3: Crear `src/scripts/theme.js`**

```js
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      localStorage.setItem('theme', 'light');
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  });
});
```

- [ ] **Step 4: Crear `src/scripts/i18n.js`**

```js
const submitBtn = document.getElementById('submitForm');
if (submitBtn) {
  submitBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    const currentLang = localStorage.getItem('language') || getBrowserLanguage();
    try {
      const response = await fetch(`lang/${currentLang}.json`);
      const translations = await response.json();
      alert(translations['form.comingSoon']);
    } catch (error) {
      console.error('Error loading translation:', error);
      alert('Contact form coming soon. Thank you for your patience!');
    }
  });
}

function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  const shortLang = lang.split('-')[0];
  return ['es', 'ja'].includes(shortLang) ? shortLang : 'en';
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.getAttribute('placeholder')) {
          element.setAttribute('placeholder', translations[key]);
        }
      } else {
        element.textContent = translations[key];
      }
    }
  });

  document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
    const key = element.getAttribute('data-translate-placeholder');
    if (translations[key]) {
      element.setAttribute('placeholder', translations[key]);
    }
  });
}

function loadTranslations(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load translations');
      return response.json();
    })
    .then(translations => {
      applyTranslations(translations);
      document.documentElement.setAttribute('lang', lang);
    })
    .catch(error => {
      console.error('Error loading translations:', error);
      if (lang !== 'en') {
        loadTranslations('en');
        document.getElementById('language-switcher').value = 'en';
      }
    });
}

document.addEventListener('DOMContentLoaded', function() {
  const languageSwitcher = document.getElementById('language-switcher');
  const savedLanguage = localStorage.getItem('language') || 'en';
  languageSwitcher.value = savedLanguage;
  loadTranslations(savedLanguage);
  languageSwitcher.addEventListener('change', function() {
    const selectedLanguage = this.value;
    localStorage.setItem('language', selectedLanguage);
    loadTranslations(selectedLanguage);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add src/scripts
git commit -m "feat: divide script.js en modulos astro"
```

---

### Task 4: Layout.astro con head completo + index que lo usa

**Files:**
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (usar el Layout, slot vacío)

**Interfaces:**
- Consumes: `src/styles/style.css`, `src/styles/dark-mode.css`, `src/scripts/aos-init.js`, `src/scripts/nav.js`, `src/scripts/theme.js`, `src/scripts/i18n.js` (todos creados en Tasks 2-3).
- Produces: `<Layout>` con `<slot />`; lo consumen todas las páginas.

- [ ] **Step 1: Crear `src/layouts/Layout.astro`**

```astro
---
import '../styles/style.css';
import '../styles/dark-mode.css';
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SEO Meta Tags -->
  <title>Natanohj - Content Creator & Programmer | Gaming, Tech, and Creative Content</title>
  <meta name="description" content="Natanohj is a content creator and programmer sharing passion for technology, gaming, and creative content. Join me for tutorials, coding projects, and entertainment.">
  <meta name="keywords" content="content creator, programmer, gaming content, tech tutorials, coding projects, YouTube creator, streaming">
  <meta name="author" content="Natan">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Social Media Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Natanohj - Content Creator & Programmer">
  <meta property="og:description" content="Join me for gaming content, tech tutorials, and creative programming projects.">
  <meta property="og:url" content="https://natandev.com">
  <meta property="og:image" content="https://natandev.com/assets/images/og-image.jpg">

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@natanohj_9">
  <meta name="twitter:creator" content="@natanohj_9">

  <!-- Favicon -->
  <link rel="icon" href="/assets/images/favi.ico" type="image/x-icon">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://natandev.com">

  <!-- Preload Critical Resources -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>

  <!-- Stylesheets (CDNs) -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Natanohj",
      "url": "https://natandev.com",
      "sameAs": [
        "https://youtube.com/@natanyume",
        "https://www.tiktok.com/@natan.kimito",
        "https://x.com/natanohj_9",
        "https://www.instagram.com/natansolano_",
        "https://github.com/Natanmiuz"
      ],
      "jobTitle": "Content Creator and Programmer",
      "description": "Content creator and programmer sharing passion for technology, gaming, and creative content.",
      "knowsAbout": ["Programming", "Content Creation", "Gaming", "Technology"],
      "email": "contact@natandev.com"
    }
  </script>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <slot />
  <!-- Ejecutado en Node al buildear: los scripts NO se importan en frontmatter.
       Se referencian como <script src="../scripts/x.js"> (Astro los bundlea y los emite
       como type="module" al final del body; corren tras el script clásico del CDN). -->
  <script is:inline src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
  <script src="../scripts/aos-init.js"></script>
  <script src="../scripts/nav.js"></script>
  <script src="../scripts/theme.js"></script>
  <script src="../scripts/i18n.js"></script>
</body>
</html>
```

Notas: el meta `apple-touch-icon` se omite (arreglo aprobado). OJO con los scripts (lección de esta ejecución): los imports JS del frontmatter se ejecutarían en Node y reventarían el build (`AOS is not defined`, `document` no existe). Los scripts propios se referencian como `<script src="../scripts/*.js">` (Astro los bundlea como `type="module"` al final del body); el CDN clásico de AOS lleva `is:inline` para que Astro lo emita verbatim sin transformarlo a un import de módulo. Orden resultante en `dist/`: CDN clásico → módulos bundled (AOS.init encuentra el global).

- [ ] **Step 2: Sustituir el shell en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout>
</Layout>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: exit 0; `dist/index.html` contiene el `<head>` completo, el JSON-LD y el script CDN de AOS; CSS y JS bundled en `dist/_astro/*.css` y `dist/_astro/*.js` (Astro hashea según contenido; no esperar rutas fijas).

- [ ] **Step 4: Commit**

```bash
git add src/layouts src/pages
git commit -m "feat: layout con head completo"
```

---

### Task 5: Componente Header

**Files:**
- Create: `src/components/Header.astro`
- Modify: `src/pages/index.astro` (renderizar `<Header />`)

**Interfaces:**
- Consumes: `Layout` (Task 4). Depende de los ids `#language-switcher`, `#theme-toggle`, `#hamburger`, `#nav-menu` que esperan `nav.js`, `theme.js` e `i18n.js`.
- Produces: `<Header />` sin props; markup del navbar original incluyendo `data-translate`.

- [ ] **Step 1: Crear `src/components/Header.astro`**

```astro
<header>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="container">
      <div class="nav-left">
        <a href="#hero" class="logo" aria-label="Natanohj homepage">Natanohj<span>.</span></a>
      </div>

      <div class="nav-center">
        <ul class="nav-menu" id="nav-menu">
          <li class="nav-item"><a href="#hero" class="nav-link active" data-translate="nav.home">Home</a></li>
          <li class="nav-item"><a href="#content-creator" class="nav-link" data-translate="nav.contentCreator">Content Creator</a></li>
          <li class="nav-item"><a href="#programmer" class="nav-link" data-translate="nav.programmer">Programmer</a></li>
          <li class="nav-item"><a href="#contact" class="nav-link" data-translate="nav.contact">Contact</a></li>
        </ul>
      </div>

      <div class="nav-right">
        <div class="nav-controls">
          <select id="language-switcher">
            <option value="en" data-translate="languages.english" selected>English</option>
            <option value="ja" data-translate="languages.japanese">Japanese</option>
            <option value="es" data-translate="languages.spanish">Spanish</option>
          </select>
          <button id="theme-toggle" aria-label="Toggle Dark Mode">
            <i class="fas fa-moon"></i>
          </button>
        </div>
        <button class="hamburger" id="hamburger">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </nav>
</header>
```

- [ ] **Step 2: Renderizar en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
---
<Layout>
  <Header />
</Layout>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: exit 0; `dist/index.html` contiene el navbar completo con sus ids.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro src/pages/index.astro
git commit -m "feat: componente header"
```

---

### Task 6: Componentes Hero y ContentCreator + CSS de enlaces disabled

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/ContentCreator.astro`
- Modify: `src/styles/style.css` (añadir bloque `.disabled` al final, tras `.footer-social-link.kick:hover` que está en la línea ~819 del original)
- Modify: `src/pages/index.astro` (renderizar `<Hero />` y `<ContentCreator />` dentro de `<main id="main-content">`)

**Interfaces:**
- Consumes: `Layout`, `Header` (Tasks 4-5).
- Produces: `<Hero />`, `<ContentCreator />` sin props; markup con `data-aos`/`data-translate` originales. El hero renderiza `home.title`/`home.subtitle` (keys que se añaden a los JSON en Task 9); hasta entonces se muestra el texto HTML por defecto (comportamiento esperado: el script no toca keys ausentes).

- [ ] **Step 1: Crear `src/components/Hero.astro`**

```astro
<section class="hero" id="hero" aria-label="Hero section">
  <div class="shapes" aria-hidden="true">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
  <div class="container">
    <div class="hero-content">
      <h1 data-aos="fade-up" data-translate="home.title">Natanohj</h1>
      <p data-aos="fade-up" data-aos-delay="200" data-translate="home.subtitle">I build, I create, I share my world.</p>
      <div class="hero-buttons">
        <a href="#content-creator" class="btn btn-primary" data-aos="fade-up" data-aos-delay="400" data-translate="nav.contentCreator">Content Creator</a>
        <a href="#programmer" class="btn btn-secondary" data-aos="fade-up" data-aos-delay="600" data-translate="nav.programmer">Programmer</a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Crear `src/components/ContentCreator.astro`** (los enlaces Facebook, Twitch y Kick llevan la clase `disabled`, `aria-disabled="true"`, sin `href` ni `target`)

```astro
<section class="section" id="content-creator">
  <div class="container">
    <div class="section-title" data-aos="fade-up">
      <h2 data-translate="content.title">Content Creator</h2>
      <p data-translate="content.subtitle">Check out my latest content and follow me on social media!</p>
    </div>

    <div class="latest-content" data-aos="fade-up">
      <h3 class="content-title" data-translate="content.latestVideos">Latest Videos</h3>
      <div class="video-container">
        <iframe
          src="https://www.youtube.com/embed/1g3joMapdIY?si=ewlfwWeu5GE8j4-H"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <div class="social-links" data-aos="fade-up">
      <a href="https://www.tiktok.com/@natan.kimito" class="social-link tiktok" target="_blank" rel="noopener">
        <i class="fab fa-tiktok"></i>
        <span>TikTok</span>
      </a>
      <a href="https://youtube.com/@natanyume" class="social-link youtube" target="_blank" rel="noopener">
        <i class="fab fa-youtube"></i>
        <span>YouTube</span>
      </a>
      <a class="social-link facebook disabled" aria-disabled="true" rel="noopener">
        <i class="fab fa-facebook-f"></i>
        <span>Facebook</span>
      </a>
      <a href="https://x.com/natanohj_9" class="social-link twitter" target="_blank" rel="noopener">
        <i class="fab fa-twitter"></i>
        <span>Twitter/X</span>
      </a>
      <a href="https://www.instagram.com/natansolano_" class="social-link instagram" target="_blank" rel="noopener">
        <i class="fab fa-instagram"></i>
        <span>Instagram</span>
      </a>
      <a class="social-link twitch disabled" aria-disabled="true" rel="noopener">
        <i class="fab fa-twitch"></i>
        <span>Twitch</span>
      </a>
      <a class="social-link kick disabled" aria-disabled="true" rel="noopener">
        <i class="fas fa-gamepad"></i>
        <span>Kick</span>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Añadir el CSS de `.disabled` al final de `src/styles/style.css`** (apéndice; debe ir DESPUÉS de los hover de marca para ganar por orden de aparición con igual especificidad)

```css
    .social-link.disabled,
    .footer-social-link.disabled {
      filter: grayscale(1);
      opacity: 0.55;
      cursor: not-allowed;
    }

    .social-link.disabled:hover,
    .footer-social-link.disabled:hover {
      transform: none;
      box-shadow: none;
    }
```

- [ ] **Step 4: Renderizar en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ContentCreator from '../components/ContentCreator.astro';
---
<Layout>
  <Header />
  <main id="main-content">
    <Hero />
    <ContentCreator />
  </main>
</Layout>
```

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: exit 0. Inspeccionar `dist/index.html`: los 3 enlaces disabled NO contienen `href`; el iframe de YouTube está presente.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/components/ContentCreator.astro src/styles/style.css src/pages/index.astro
git commit -m "feat: hero y content creator con links disabled"
```

---

### Task 7: Componentes Programmer y Contact

**Files:**
- Create: `src/components/Programmer.astro`
- Create: `src/components/Contact.astro`
- Modify: `src/pages/index.astro` (renderizar `<Programmer />` y `<Contact />`)

**Interfaces:**
- Consumes: Tasks 4-6.
- Produces: `<Programmer />`, `<Contact />` sin props; `#submitForm` esperado por `i18n.js`.

- [ ] **Step 1: Crear `src/components/Programmer.astro`**

```astro
<section class="section" id="programmer">
  <div class="container">
    <div class="section-title" data-aos="fade-up">
      <h2 data-translate="programmer.title">Programmer</h2>
      <p data-translate="programmer.subtitle">Building innovative solutions with code</p>
    </div>

    <div class="simple-content" data-aos="fade-up">
      <p class="programmer-description" data-translate="programmer.description">
        I'm a beginner programmer who enjoys learning through hands-on projects. I love experimenting with code and building simple applications as I learn.
      </p>

      <div class="simple-projects" data-aos="fade-up">
        <h3 data-translate="programmer.projects.title">Some of my practice projects:</h3>
        <ul class="projects-list">
          <li><span class="project-title">image-resizer</span> - <span data-translate="programmer.projects.imageResizer">A simple web-based tool to resize images</span></li>
          <li><span class="project-title">AudioConvert</span> - <span data-translate="programmer.projects.audioConvert">A basic audio conversion tool</span></li>
          <li><span class="project-title">VideoConvert</span> - <span data-translate="programmer.projects.videoConvert">A basic video conversion tool</span></li>
        </ul>
      </div>

      <div class="github-section" data-aos="fade-up">
        <p data-translate="programmer.github.message">You can find more of my small projects on my GitHub:</p>
        <a href="https://github.com/Natanmiuz" class="github-link" target="_blank" rel="noopener">
          <i class="fab fa-github"></i>
          <span data-translate="programmer.github.profile">GitHub Profile</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Crear `src/components/Contact.astro`**

```astro
<section class="section" id="contact">
  <div class="container">
    <div class="section-title" data-aos="fade-up">
      <h2 data-translate="contact.title">Let's Chat!</h2>
      <p data-translate="contact.subtitle">Feel free to reach out if you want to talk, share ideas, or connect!</p>
    </div>

    <div class="contact-container">
      <div class="contact-info" data-aos="fade-up">
        <h3 data-translate="contact.connect">Say Hi!</h3>
        <p data-translate="contact.message">I'd love to hear from you! Whether you want to chat about tech, share cool ideas, or just say hello - drop me a message and let's connect!</p>

        <div class="contact-method">
          <div class="contact-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <a href="mailto:contact@natandev.com" class="contact-detail" data-translate="contact.email">You can email me anytime</a>
        </div>

        <div class="contact-method">
          <div class="contact-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <span class="contact-detail" data-translate="contact.location">Somewhere in the digital world 🌎</span>
        </div>

        <div class="contact-method">
          <div class="contact-icon">
            <i class="fas fa-comments"></i>
          </div>
          <span class="contact-detail" data-translate="contact.availability">Always open for a good chat!</span>
        </div>
      </div>

      <div class="contact-form" data-aos="fade-up" data-aos-delay="200">
        <form id="contactForm">
          <div class="form-group">
            <label for="name" class="form-label" data-translate="form.name">What should I call you?</label>
            <input type="text" id="name" class="form-control" placeholder="" data-translate-placeholder="form.placeholders.name" required>
          </div>

          <div class="form-group">
            <label for="email" class="form-label" data-translate="form.email">Where can I reach you?</label>
            <input type="email" id="email" class="form-control" placeholder="" data-translate-placeholder="form.placeholders.email" required>
          </div>

          <div class="form-group">
            <label for="message" class="form-label" data-translate="form.message">What's on your mind?</label>
            <textarea id="message" class="form-control" placeholder="" data-translate-placeholder="form.placeholders.message" required></textarea>
          </div>

          <button type="button" id="submitForm" class="btn btn-primary" data-translate="form.submit">Say Hello!</button>
        </form>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Renderizar en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ContentCreator from '../components/ContentCreator.astro';
import Programmer from '../components/Programmer.astro';
import Contact from '../components/Contact.astro';
---
<Layout>
  <Header />
  <main id="main-content">
    <Hero />
    <ContentCreator />
    <Programmer />
    <Contact />
  </main>
</Layout>
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: exit 0; las secciones `#programmer` y `#contact` en `dist/index.html`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Programmer.astro src/components/Contact.astro src/pages/index.astro
git commit -m "feat: componentes programmer y contact"
```

---

### Task 8: Componente Footer + composición final de index

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro` (renderizar `<Footer />`; el Layout queda completo)

**Interfaces:**
- Consumes: Tasks 4-7.
- Produces: `<Footer />`; renderiza `© {new Date().getFullYear()}` con Astro (año dinámico, sin JS) y `footer.copyright` sigue traduciéndose — los JSON sin año se definen en Task 9.

- [ ] **Step 1: Crear `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-container">
      <div class="footer-about">
        <h4 class="footer-title" data-translate="footer.about">About Natan</h4>
        <p data-translate="footer.aboutText">Programmer by day, content creator by night. I share my passion for technology, gaming, and creative content across multiple platforms.</p>
      </div>
      <div class="footer-links">
        <h4 class="footer-title" data-translate="footer.quickLinks">Quick Links</h4>
        <ul>
          <li><a href="#hero"><i class="fas fa-chevron-right"></i> <span data-translate="nav.home">Home</span></a></li>
          <li><a href="#content-creator"><i class="fas fa-chevron-right"></i> <span data-translate="nav.contentCreator">Content Creator</span></a></li>
          <li><a href="#programmer"><i class="fas fa-chevron-right"></i> <span data-translate="nav.programmer">Programmer</span></a></li>
          <li><a href="#contact"><i class="fas fa-chevron-right"></i> <span data-translate="nav.contact">Contact</span></a></li>
        </ul>
      </div>

      <div class="footer-social">
        <h4 class="footer-title" data-translate="footer.followMe">Follow Me</h4>
        <div class="footer-social-icons">
          <a href="https://www.tiktok.com/@natan.kimito" class="footer-social-link tiktok" aria-label="TikTok">
            <i class="fab fa-tiktok"></i>
          </a>
          <a href="https://youtube.com/@natanyume" class="footer-social-link youtube" aria-label="YouTube">
            <i class="fab fa-youtube"></i>
          </a>
          <a class="footer-social-link facebook disabled" aria-disabled="true" aria-label="Facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://x.com/natanohj_9" class="footer-social-link twitter" aria-label="Twitter/X">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="https://www.instagram.com/natansolano_" class="footer-social-link instagram" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a class="footer-social-link twitch disabled" aria-disabled="true" aria-label="Twitch">
            <i class="fab fa-twitch"></i>
          </a>
          <a class="footer-social-link kick disabled" aria-disabled="true" aria-label="Kick">
            <i class="fas fa-gamepad"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {year} <span data-translate="footer.copyright">Natan. All rights reserved.</span></p>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Completar `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ContentCreator from '../components/ContentCreator.astro';
import Programmer from '../components/Programmer.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---
<Layout>
  <Header />
  <main id="main-content">
    <Hero />
    <ContentCreator />
    <Programmer />
    <Contact />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: exit 0; en `dist/index.html`: `© {año actual}` en el footer, 3 enlaces disabled sin `href`, texto de about restaurado.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat: footer con ano dinamico y composicion final"
```

---

### Task 9: Arreglos de i18n en los 3 JSON

**Files:**
- Modify: `public/lang/en.json`
- Modify: `public/lang/es.json`
- Modify: `public/lang/ja.json`

**Interfaces:**
- Consumes: formato de keys existente (notación de puntos).
- Produces: keys `home.title`, `footer.aboutText` y `footer.copyright` corregidas en los 3 idiomas (consumidas por `i18n.js` en runtime y por el markup de Hero/Footer).

- [ ] **Step 1: Editar `public/lang/en.json`** — tres cambios:

1. Añadir tras la línea 9 (antes de `"home.subtitle"`):
```json
  "home.title": "Natanohj",
```
2. `"footer.aboutText"` → valor:
```json
  "footer.aboutText": "Programmer by day, content creator by night. I share my passion for technology, gaming, and creative content across multiple platforms.",
```
3. `"footer.copyright"` → valor (sin año):
```json
  "footer.copyright": "Natan. All rights reserved.",
```

- [ ] **Step 2: Editar `public/lang/es.json`** — tres cambios:

1. Añadir antes de `"home.subtitle"`:
```json
  "home.title": "Natanohj",
```
2. `"footer.aboutText"` → valor:
```json
  "footer.aboutText": "Programador de día, creador de contenido de noche. Comparto mi pasión por la tecnología, los videojuegos y el contenido creativo en varias plataformas.",
```
3. `"footer.copyright"` → valor:
```json
  "footer.copyright": "Natan. Todos los derechos reservados.",
```

- [ ] **Step 3: Editar `public/lang/ja.json`** — tres cambios:

1. Añadir antes de `"home.subtitle"`:
```json
  "home.title": "Natanohj",
```
2. `"footer.aboutText"` → valor:
```json
  "footer.aboutText": "昼はプログラマー、夜はコンテンツクリエイター。テクノロジーやゲーム、クリエイティブなコンテンツへの情熱を複数のプラットフォームで発信しています。",
```
3. `"footer.copyright"` → valor:
```json
  "footer.copyright": "Natan. 全著作権所有。",
```

- [ ] **Step 4: Verificar JSON válido**

```powershell
Get-Content public\lang\en.json | ConvertFrom-Json | Out-Null; Get-Content public\lang\es.json | ConvertFrom-Json | Out-Null; Get-Content public\lang\ja.json | ConvertFrom-Json | Out-Null
```

Expected: sin errores (los 3 parsean).

- [ ] **Step 5: Verificar build + contenido de dist**

Run: `npm run build`
Expected: exit 0; `dist/lang/en.json` contiene las 3 keys nuevas/corregidas; `dist/lang/es.json` y `dist/lang/ja.json` idem.

- [ ] **Step 6: Commit**

```bash
git add public/lang
git commit -m "fix: textos i18n home title, footer about y copyright"
```

---

### Task 10: Limpieza de archivos legados + actualizar AGENTS.md

**Files:**
- Delete: `index.html`, `css/`, `js/`, `lang/`, `assets/` (contenido migrado: `css/*` → `src/styles/`, `js/script.js` → 4 módulos en `src/scripts/`, `lang/*` → `public/lang/`, `assets/images/favi.ico` → `public/assets/images/`)
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: nada nuevo; elimina duplicados para que no existan dos fuentes de verdad.

- [ ] **Step 1: Eliminar archivos legados**

```powershell
Remove-Item -Recurse -Force css, js, lang, assets, index.html
```

- [ ] **Step 2: Validar que existe copia de cada cosa en src/public** (antes de borrar se hizo en Tasks 2-9; esta comprobación evita pérdida)

```powershell
Test-Path src\styles\style.css; Test-Path src\styles\dark-mode.css; Test-Path src\scripts\nav.js; Test-Path src\scripts\theme.js; Test-Path src\scripts\i18n.js; Test-Path src\scripts\aos-init.js; Test-Path public\lang\en.json; Test-Path public\lang\es.json; Test-Path public\lang\ja.json; Test-Path public\assets\images\favi.ico
```

Expected: todos `True`.

- [ ] **Step 3: Reemplazar `AGENTS.md`** por:

```markdown
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
```

- [ ] **Step 4: Verificar build post-limpieza**

Run: `npm run build`
Expected: exit 0; `dist/index.html`, `dist/lang/*.json`, `dist/assets/images/favi.ico`, CSS/JS bundled. Las rutas `/assets/images/favi.ico` y `lang/...` resuelven.

- [ ] **Step 5: Commit**

```bash
git add -A AGENTS.md
git add -u
git commit -m "chore: limpia archivos legados y actualiza agents"
```

---

### Task 11: Verificación completa final

**Files:** ninguno (solo comprobaciones + commit si algo cambió).

- [ ] **Step 1: Build y preview**

Run: `npm run build`; luego `npm run preview` (servidor en http://localhost:4321 por defecto).
Expected: página carga sin errores de consola (F12).

- [ ] **Step 2: Verificar checklist del spec** — de una en una, manualmente en el navegador:

1. `dist/` contiene `lang/` con 3 JSONs y `assets/images/favi.ico`.
2. Switcher cambia en/es/ja; `localStorage.language` persiste tras recargar; con `localStorage.language` vacío y navegador en es/ja se carga ese idioma.
3. Tema: toggle oscuro/claro, icono `fa-moon`↔`fa-sun`, persiste tras recargar.
4. Viewport móvil (F12, ~375px): hamburguesa abre/cierra menú, los enlaces cierran el menú.
5. Scroll: navbar gana `.scrolled` tras 50px; el `.nav-link` activo sigue la sección visible.
6. AOS anima los elementos al hacer scroll (primera vez; `once: true`).
7. Clic en `#submitForm`: alert «coming soon» en el idioma seleccionado.
8. Redes disabled (Facebook/Twitch/Kick en hero y footer): atenuadas (grayscale+opacity), `cursor: not-allowed`, sin hover y sin navegación al hacer clic.
9. Footer: texto «Programmer by day…» y equivalente es/ja; año = 2026.
10. SEO: `view-source` muestra meta, canonical, JSON-LD y el title original; no hay referencia a `apple-touch-icon`.
11. Sintaxis: `dist/lang/*.json` parsean (`ConvertFrom-Json`).

- [ ] **Step 3: Commit final si hubo correcciones**

```bash
git add -A
git commit -m "fix: ajustes de verificacion"
```

(omite el commit si no hubo cambios)