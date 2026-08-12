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