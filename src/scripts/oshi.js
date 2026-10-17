// The oshi picker recolours the page through CSS :has() alone; this only
// remembers the choice (same pattern as theme.js).
const KEY = 'oshi';

document.querySelectorAll('.oshi input[name="oshi"]').forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    try { localStorage.setItem(KEY, input.value); } catch (e) {}
  });
});
