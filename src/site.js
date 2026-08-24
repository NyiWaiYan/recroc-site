(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* legacy one-page anchors from the old site */
  var legacy = { '#services': '/services/', '#about': '/about/', '#process': '/process/',
                 '#why': '/about/', '#faq': '/contact/', '#contact': '/contact/' };
  if (location.hash && legacy[location.hash] && !document.querySelector(location.hash)) {
    location.replace(legacy[location.hash]);
  }

  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.085,          // frame-rate independent easing, smoother than a fixed duration
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6
    });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeSheet();
    var off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 60) - 12;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.0 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* reveals */
  var targets = $$('[data-rv], [data-rvf]');
  if (!('IntersectionObserver' in window)) targets.forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* nav hairline */
  var nav = $('[data-nav]');
  function onScroll() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile sheet */
  var burger = $('[data-burger]'), sheet = $('[data-sheet]');
  function closeSheet() {
    if (!sheet || !burger) return;
    sheet.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = sheet.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  }

  /* accordion */
  $$('[data-acc]').forEach(function (head) {
    var panel = document.getElementById(head.getAttribute('aria-controls'));
    if (!panel) return;
    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      var group = head.closest('[data-accg]');
      if (!open && group) {
        $$('[data-acc][aria-expanded="true"]', group).forEach(function (o) {
          var op = document.getElementById(o.getAttribute('aria-controls'));
          o.setAttribute('aria-expanded', 'false');
          if (op) op.style.height = '0px';
        });
      }
      head.setAttribute('aria-expanded', String(!open));
      panel.style.transition = 'height .42s cubic-bezier(.22,1,.36,1)';
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        setTimeout(function () {
          if (head.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
        }, 440);
      }
    });
  });
  window.addEventListener('resize', function () {
    $$('[data-acc][aria-expanded="true"]').forEach(function (h) {
      var p = document.getElementById(h.getAttribute('aria-controls'));
      if (p) p.style.height = 'auto';
    });
  }, { passive: true });

  /* services filter pills */
  var pills = $('[data-filters]');
  if (pills) {
    var groups = $$('[data-grp]');
    pills.addEventListener('click', function (e) {
      var btn = e.target.closest('.pill');
      if (!btn) return;
      var f = btn.getAttribute('data-f');
      $$('.pill', pills).forEach(function (p) { p.setAttribute('aria-pressed', String(p === btn)); });
      groups.forEach(function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-grp') === f); });
    });
  }

  /* process */
  var proc = $('[data-proc]');
  if (proc) {
    var steps = $$('[data-step]', proc);
    var numEl = $('[data-proc-n]', proc), labEl = $('[data-proc-lab]', proc), fillEl = $('[data-proc-fill]', proc);
    var cur = -1;
    function setStep(i) {
      if (i === cur || i < 0) return;
      cur = i;
      steps.forEach(function (s, n) { s.classList.toggle('on', n === i); });
      if (numEl) numEl.textContent = steps[i].getAttribute('data-n');
      if (labEl) labEl.textContent = steps[i].getAttribute('data-t');
      if (fillEl) fillEl.style.width = ((i + 1) / steps.length * 100) + '%';
    }
    if (!('IntersectionObserver' in window)) steps.forEach(function (s) { s.classList.add('on'); });
    else {
      var pio = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) setStep(steps.indexOf(en.target)); });
      }, { rootMargin: '-42% 0px -42% 0px' });
      steps.forEach(function (s) { pio.observe(s); });
      setStep(0);
    }
  }

  /* contact form: preselect topic from ?s= */
  var sel = $('[data-preselect]');
  if (sel) {
    var want = new URLSearchParams(location.search).get('s');
    if (want) $$('option', sel).forEach(function (o) {
      if (o.value.toLowerCase() === want.toLowerCase()) o.selected = true;
    });
  }
  var form = $('[data-form]');
  if (form) form.addEventListener('submit', function () {
    var b = $('button[type="submit"]', form);
    if (b) { b.disabled = true; b.childNodes[0].nodeValue = 'Sending '; }
  });
})();
