/* ==========================================================
   RECROC — interactions
   Lenis · reveals · mega nav · process rail · monitor OSD
   ========================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
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
    closeSheet(); closeMega();
    var off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72) - 18;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  /* ---------- legacy one-page anchors ---------- */
  (function () {
    var map = { '#services': '/services/', '#about': '/about/', '#process': '/process/',
                '#why': '/about/', '#faq': '/contact/', '#contact': '/contact/' };
    var h = location.hash;
    if (h && map[h] && !document.querySelector(h)) {
      location.replace(map[h]);
    }
  })();

  /* ---------- reveals ---------- */
  var rvTargets = $$('[data-rv], [data-rv-img], .rule, .pillar, .pstrip-i');
  if (!('IntersectionObserver' in window)) {
    rvTargets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    rvTargets.forEach(function (el) { io.observe(el); });
  }

  /* hero headline fires on paint, not scroll */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      $$('[data-words]').forEach(function (el) { el.classList.add('words-in'); });
    });
  });

  /* ---------- nav ---------- */
  var nav = $('[data-nav]');
  var prog = $('[data-prog]');

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? Math.min(y / h, 1) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- mega panel ---------- */
  var megaWrap = $('[data-mega-wrap]');
  var mega = $('[data-mega]');
  var megaBtn = $('[data-mega-btn]');
  var megaTimer = null;

  function openMega() {
    if (!mega) return;
    clearTimeout(megaTimer);
    mega.classList.add('is-open');
    if (megaWrap) megaWrap.classList.add('is-open');
    if (megaBtn) megaBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMega() {
    if (!mega) return;
    mega.classList.remove('is-open');
    if (megaWrap) megaWrap.classList.remove('is-open');
    if (megaBtn) megaBtn.setAttribute('aria-expanded', 'false');
  }
  function deferClose() { clearTimeout(megaTimer); megaTimer = setTimeout(closeMega, 160); }

  if (megaWrap && mega) {
    megaWrap.addEventListener('mouseenter', openMega);
    megaWrap.addEventListener('mouseleave', deferClose);
    mega.addEventListener('mouseenter', openMega);
    mega.addEventListener('mouseleave', deferClose);
    megaWrap.addEventListener('focusin', openMega);
    mega.addEventListener('focusin', openMega);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMega(); closeSheet(); }
    });
    document.addEventListener('focusin', function (e) {
      if (!mega.contains(e.target) && !megaWrap.contains(e.target)) closeMega();
    });
  }

  /* ---------- mobile sheet ---------- */
  var burger = $('[data-burger]');
  var sheet = $('[data-sheet]');

  function closeSheet() {
    if (!sheet || !burger) return;
    sheet.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = sheet.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('[data-sheet-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        var open = panel.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeSheet();
    });
  }

  /* ---------- accordion ---------- */
  $$('[data-acc]').forEach(function (head) {
    var panel = document.getElementById(head.getAttribute('aria-controls'));
    if (!panel) return;

    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      var group = head.closest('[data-acc-group]');

      if (!open && group) {
        $$('[data-acc][aria-expanded="true"]', group).forEach(function (other) {
          if (other === head) return;
          var op = document.getElementById(other.getAttribute('aria-controls'));
          other.setAttribute('aria-expanded', 'false');
          if (op) { op.style.height = '0px'; op.classList.remove('is-open'); }
        });
      }

      head.setAttribute('aria-expanded', String(!open));
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        panel.classList.remove('is-open');
        requestAnimationFrame(function () {
          panel.style.transition = 'height .46s cubic-bezier(.22,1,.36,1)';
          panel.style.height = '0px';
        });
      } else {
        panel.classList.add('is-open');
        panel.style.transition = 'height .46s cubic-bezier(.22,1,.36,1)';
        panel.style.height = panel.scrollHeight + 'px';
        window.setTimeout(function () {
          if (head.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
        }, 480);
      }
    });
  });

  window.addEventListener('resize', function () {
    $$('[data-acc][aria-expanded="true"]').forEach(function (h) {
      var p = document.getElementById(h.getAttribute('aria-controls'));
      if (p) p.style.height = 'auto';
    });
  }, { passive: true });

  /* ---------- process rail ---------- */
  var procRoot = $('[data-proc]');
  if (procRoot) {
    var steps = $$('[data-proc-step]', procRoot);
    var nums = $$('[data-proc-num]', procRoot);
    var ticks = $$('[data-proc-tick]', procRoot);
    var fill = $('[data-proc-fill]', procRoot);
    var tcEl = $('[data-proc-tc]', procRoot);
    var codes = steps.map(function (s) { return s.getAttribute('data-tc') || '00:00'; });
    var current = -1;

    function setStep(i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
      nums.forEach(function (n, x) {
        n.classList.toggle('is-on', x === i);
        n.classList.toggle('is-out', x < i);
      });
      ticks.forEach(function (t, n) { t.classList.toggle('is-on', n <= i); });
      if (fill) fill.style.width = ((i + 1) / steps.length * 100) + '%';
      if (tcEl) tcEl.textContent = codes[i];
    }

    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('is-on'); });
      nums.forEach(function (n, i) { if (i === 0) n.classList.add('is-on'); });
    } else {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setStep(steps.indexOf(en.target));
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      steps.forEach(function (s) { pio.observe(s); });
      setStep(0);
    }
  }

  /* ---------- monitor timecode ---------- */
  var tcs = $$('[data-tc-live]');
  if (tcs.length) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = 0;
    var run = function () {
      tick++;
      var f = tick % 24;
      var s = Math.floor(tick / 24) % 60;
      var m = Math.floor(tick / 1440) % 60;
      tcs.forEach(function (el) { el.textContent = '00:' + pad(m) + ':' + pad(s) + ':' + pad(f); });
    };
    if (reduce) { run(); }
    else {
      var last = 0;
      (function loop(t) {
        if (t - last > 41) { run(); last = t; }
        requestAnimationFrame(loop);
      })(0);
    }
  }

  /* ---------- form ---------- */
  var form = $('[data-form]');
  if (form) {
    form.addEventListener('submit', function () {
      var b = $('.form-submit', form);
      if (b) { b.disabled = true; b.childNodes[0].nodeValue = 'Sending '; }
    });
    var sel = $('[data-preselect]');
    if (sel) {
      var want = new URLSearchParams(location.search).get('s');
      if (want) {
        $$('option', sel).forEach(function (o) {
          if (o.value.toLowerCase() === want.toLowerCase()) { o.selected = true; }
        });
      }
    }
  }
})();
