/* ============================================
   RECROC STUDIO - Single Page Interactions
   ============================================ */

const nav = document.querySelector('[data-nav]');
const revealItems = document.querySelectorAll('[data-reveal]');
const statBlocks = document.querySelectorAll('[data-count-stats]');

function updateNav() {
  if (!nav) return;
  nav.classList.toggle('is-scrolled', window.scrollY > 80);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateNumber(el) {
  if (el.dataset.done === 'true') return;

  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  el.dataset.done = 'true';

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(target * easeOutCubic(progress));
    el.textContent = progress === 1 ? `${target}${suffix}` : `${value}`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function animateStats(block) {
  block.querySelectorAll('[data-count]').forEach(animateNumber);
}

function reveal(el) {
  el.classList.add('is-visible');
  if (el.matches('[data-count-stats]')) {
    animateStats(el);
  }
}

function setupReveal() {
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(reveal);
    statBlocks.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealItems.forEach((el) => observer.observe(el));
}

window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('load', updateNav);
setupReveal();
