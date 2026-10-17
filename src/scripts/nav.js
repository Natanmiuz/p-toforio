const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');

hamburger?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('active');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('active');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

const updateNavbar = () => navbar?.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// Scrollspy: the current section is the one crossing a line ~20% from the top
// of the viewport, so nothing reads layout on every scroll event.
const setActive = (id) => {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
};

const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActive(entry.target.id);
  });
}, { rootMargin: '-20% 0px -79% 0px' });

document.querySelectorAll('section[id]').forEach(section => spy.observe(section));
