
AOS.init({
  duration: 800,
  easing: 'ease',
  once: true,
  offset: 100
});

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
