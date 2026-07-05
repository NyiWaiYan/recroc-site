/* ==========================================================
   RECROC STUDIO interactions
   Lenis smooth scroll · reveals · scrollspy · timecode
   ========================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var navShell = document.querySelector('[data-nav]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.getElementById('mobile-menu');
  var spyLinks = document.querySelectorAll('[data-spy]');
  var revealItems = document.querySelectorAll('[data-reveal]');
  var statBlocks = document.querySelectorAll('[data-count-stats]');

  /* ----- Lenis smooth scroll ----- */
  var lenis = null;

  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function scrollToTarget(target) {
    var offset = -90;
    if (lenis) {
      lenis.scrollTo(target, { offset: offset, duration: 1.3 });
    } else {
      var top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
    history.replaceState(null, '', id);
  });

  /* ----- Nav: scrolled state + hide on scroll down ----- */
  var lastY = window.scrollY;

  function updateNav() {
    if (!navShell) return;
    var y = window.scrollY;

    navShell.classList.toggle('is-scrolled', y > 40);

    if (!menuOpen) {
      if (y > 480 && y > lastY + 6) {
        navShell.classList.add('is-hidden');
      } else if (y < lastY - 6 || y < 480) {
        navShell.classList.remove('is-hidden');
      }
    }
    lastY = y;
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('load', updateNav);

  /* ----- Mobile menu ----- */
  var menuOpen = false;

  function closeMenu() {
    if (!menuOpen || !navToggle || !mobileMenu) return;
    menuOpen = false;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.hidden = true;
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      menuOpen = !menuOpen;
      navToggle.setAttribute('aria-expanded', String(menuOpen));
      navToggle.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
      mobileMenu.hidden = !menuOpen;
      if (menuOpen) navShell.classList.remove('is-hidden');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ----- Scrollspy ----- */
  if ('IntersectionObserver' in window && spyLinks.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        spyLinks.forEach(function (link) {
          var active = link.dataset.spy === id;
          link.classList.toggle('is-active', active);
          if (active) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    spyLinks.forEach(function (link) {
      var section = document.getElementById(link.dataset.spy);
      if (section) spyObserver.observe(section);
    });
  }

  /* ----- Stat count-up ----- */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el) {
    if (el.dataset.done === 'true') return;
    el.dataset.done = 'true';

    var target = Number(el.dataset.count || 0);
    var suffix = el.dataset.suffix || '';

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1600;
    var start = performance.now();

    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var value = Math.round(target * easeOutCubic(progress));
      el.textContent = progress === 1 ? target + suffix : String(value);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateStats(block) {
    block.querySelectorAll('[data-count]').forEach(animateNumber);
  }

  /* ----- Reveal on scroll ----- */
  function reveal(el) {
    el.classList.add('is-visible');
    if (el.matches('[data-count-stats]')) animateStats(el);
  }

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(reveal);
    statBlocks.forEach(animateStats);
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Headline words inside slates reveal with their [data-reveal] parent;
     the hero headline has no data-reveal parent, so kick it once painted. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var heroTitle = document.querySelector('.hero-title');
      if (heroTitle) heroTitle.classList.add('words-in');
    });
  });

  /* ----- Magnetic buttons (fine pointers only) ----- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.button-red, .vf-play').forEach(function (el) {
      var strength = el.classList.contains('vf-play') ? 14 : 8;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        var scale = el.classList.contains('vf-play') ? ' scale(1.06)' : '';
        el.style.transform = 'translate(' + (x * strength) + 'px,' + (y * strength) + 'px)' + scale;
      });

      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
      });
    });
  }
})();
