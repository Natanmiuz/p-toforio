// The saved theme is applied before first paint by the inline script in
// Layout.astro; this keeps the toggle and its icon in step with it.
const KEY = 'theme';
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

const syncIcon = () => {
  const dark = document.body.classList.contains('dark-mode');
  themeIcon?.classList.toggle('fa-sun', dark);
  themeIcon?.classList.toggle('fa-moon', !dark);
};

syncIcon();

themeToggle?.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark-mode');
  syncIcon();
  try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {}
});
