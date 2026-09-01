#!/usr/bin/env node
/* RecRoc static site generator. Output is plain HTML, committed to the repo.
   Netlify serves the files directly; no build step on deploy. `npm run build` */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/services.json'), 'utf8'));

/* Fingerprint the assets. Netlify serves /assets/* as immutable for a year,
   which is only safe when the filename changes with the content. Sources live
   in src/ and are emitted here with a content hash. */
const crypto = require('crypto');
const stamp = (srcRel, outDir, ext) => {
  const body = fs.readFileSync(path.join(ROOT, srcRel), 'utf8');
  const hash = crypto.createHash('sha256').update(body).digest('hex').slice(0, 10);
  const dir = path.join(ROOT, outDir);
  fs.mkdirSync(dir, { recursive: true });
  // drop stale fingerprints so old files do not pile up in the repo
  fs.readdirSync(dir).filter(f => f.startsWith('site.') && f.endsWith(ext) && f !== `site.${hash}${ext}`)
    .forEach(f => fs.unlinkSync(path.join(dir, f)));
  fs.writeFileSync(path.join(dir, `site.${hash}${ext}`), body);
  return `/${outDir}/site.${hash}${ext}`;
};
const CSS = stamp('src/site.css', 'assets/css', '.css');
const JS = stamp('src/site.js', 'assets/js', '.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byGroup = id => services.filter(s => s.group === id);
const find = slug => services.find(s => s.slug === slug);
const url = s => `/services/${s.slug}/`;
const groupName = id => (site.groups.find(g => g.id === id) || {}).name || '';

/* Obra Icons (MIT, Obra Studio BV) — https://icons.obra.studio
   Real paths from obra-icons-react, drawn on a 24px frame. Rendered at 1.5
   stroke, which at 16-18px display reads as roughly a 1px line. */
const ICONS = {
  arrow: '<path d="M19 12L5 12"/><path d="M13 6L19 12L13 18"/>',
  chev: '<path d="M18 10L12 16L6 10"/>',
  menu: '<path d="M19 12H5"/><path d="M19 7H5"/><path d="M19 17H5"/>',
  close: '<path d="M18.0001 6L6.00012 18"/><path d="M6.00012 6L18.0001 18"/>'
};
const MARKS = {
  video: '<path d="M20.4672 8.15137L15.079 12.0001L20.4672 15.8489V8.15137Z"/><path d="M13.5395 6.61169H5.07222C4.22197 6.61169 3.53271 7.30095 3.53271 8.1512V15.8487C3.53271 16.699 4.22197 17.3882 5.07222 17.3882H13.5395C14.3897 17.3882 15.079 16.699 15.079 15.8487V8.1512C15.079 7.30095 14.3897 6.61169 13.5395 6.61169Z"/>',
  photography: '<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/><path d="M10 4L8 6.5H4C3.44772 6.5 3 6.94772 3 7.5V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V7.5C21 6.94772 20.5523 6.5 20 6.5H16.0909L14 4H10Z"/>',
  brand: '<path d="M8 15H8.012"/><path d="M8 9.5H8.012"/><path d="M12 7H12.012"/><path d="M15.5 9.5H15.512"/><path d="M21 12C21 14.4797 15.2325 11.9604 13.6103 13.5882C11.9807 15.2234 14.4909 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>',
  dj: '<path d="M20.0614 16.7897L19.8026 17.7556C19.3738 19.356 17.7288 20.3057 16.1284 19.8769L15.1624 19.6181L16.9742 12.8566L17.9401 13.1154C19.5405 13.5443 20.4902 15.1893 20.0614 16.7897ZM20.0614 16.7897C20.0614 16.7897 21.1667 15.0002 21 12.0002C20.8334 9.00017 18.9 3.00017 12.5 3.00017L11.4585 3.00017C5.05848 3.00017 3.12515 9.00017 2.95848 12.0002C2.79182 15.0002 3.89712 16.7897 3.89712 16.7897M3.89712 16.7897L4.15594 17.7556C4.58476 19.356 6.22977 20.3057 7.83017 19.8769L8.7961 19.6181L6.98436 12.8566L6.01844 13.1154C4.41804 13.5443 3.46829 15.1893 3.89712 16.7897Z"/>',
  audio: '<path d="M5 18.1401L6.1995 18.1056"/><path d="M12 18.1401L19.2 18.0859"/><circle cx="9.00006" cy="18.14" r="2"/><path d="M5 11.9714L13.2 11.9369"/><path d="M17.9956 12.0001H19.2045"/><path d="M5 6.00012L6.1995 5.96562"/><path d="M12 6.00012L19.2 5.94588"/><circle cx="9" cy="6" r="2"/><circle cx="15.2" cy="12.1368" r="2"/>'
};
const sym = (p, id) => `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</symbol>`;
const sprite = () => `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">` +
  Object.keys(ICONS).map(k => sym(ICONS[k], 'i-' + k)).join('') +
  Object.keys(MARKS).map(k => sym(MARKS[k], 'm-' + k)).join('') +
  `</svg>`;
const ic = n => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
const mk = n => `<svg class="mk" aria-hidden="true"><use href="#m-${n}"/></svg>`;

/* colour fields, assigned per group so the palette stays deliberate */
const FIELD = { video: 'f-ink', photography: 'f-slate', brand: 'f-moss', dj: 'f-red', audio: 'f-slate' };
const STEP_FIELD = ['f-ink', 'f-slate', 'f-red', 'f-moss', 'f-ink'];
const STEP_KEY = ['listen', 'strategize', 'create', 'refine', 'deliver'];
const LIGHT = new Set(['f-sand', 'f-mist', 'f-stone']);


/* Line-art illustrations, drawn for RecRoc. White strokes on a bold ground,
   240x180 for the discipline frames and 120x120 for the process chips. */
const ILLUS = {
  art_video: '<rect x="42" y="56" width="92" height="62" rx="8"/><path d="M134 76l38-16v58l-38-16z"/><circle cx="66" cy="42" r="15"/><circle cx="106" cy="42" r="15"/><path d="M88 118v16"/><path d="M88 134l-26 26M88 134l26 26M88 134v26"/><path d="M56 88h20"/>',
  art_photography: '<rect x="34" y="54" width="172" height="106" rx="14"/><path d="M92 54l9-16h38l9 16"/><circle cx="120" cy="108" r="34"/><circle cx="120" cy="108" r="17"/><circle cx="60" cy="76" r="5"/><path d="M168 76h18"/>',
  art_brand: '<circle cx="57" cy="90" r="28"/><rect x="93" y="62" width="56" height="56" rx="6"/><path d="M185 62l26 56h-52z"/>',
  art_dj: '<rect x="26" y="38" width="188" height="118" rx="12"/><circle cx="98" cy="98" r="42"/><circle cx="98" cy="98" r="12"/><circle cx="98" cy="98" r="2.5"/><path d="M186 56l-12 14-46 40"/><rect x="168" y="104" width="12" height="40" rx="4"/><path d="M174 118h.01"/>',
  art_audio: '<path d="M40 75v30M60 54v72M80 31v118M100 63v54M120 42v96M140 23v134M160 59v62M180 38v104M200 73v34"/>'
};
const STEP_ART = {
  listen: '<circle cx="48" cy="60" r="20"/><path d="M48 40v40M40 50v20M56 50v20"/><path d="M80 40c8 12 8 28 0 40M94 30c14 18 14 42 0 60"/>',
  strategize: '<rect x="20" y="24" width="80" height="72" rx="8"/><path d="M20 46h80"/><path d="M34 62h30M34 76h48"/><circle cx="86" cy="66" r="10"/><path d="M86 62v8"/>',
  create: '<rect x="18" y="44" width="84" height="54" rx="7"/><path d="M18 60h84"/><path d="M26 44l12-16M46 44l12-16M66 44l12-16M86 44l12-16"/><path d="M48 72v14l14-7z"/>',
  refine: '<circle cx="52" cy="52" r="26"/><path d="M71 71l22 22"/><path d="M42 52h20M52 42v20"/>',
  deliver: '<path d="M22 44l38-18 38 18v40l-38 18-38-18z"/><path d="M22 44l38 18 38-18M60 62v40"/><path d="M60 26v36"/>'
};
const illus = (key, cls, ratio, rv) =>
  `<figure class="field art-field ${cls} ${ratio}"${rv ? ' data-rvf' : ''}>` +
  `<svg class="art" viewBox="0 0 240 180" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ILLUS['art_' + key] || ''}</svg>` +
  `</figure>`;
const stepArt = (key, cls) =>
  `<span class="chip ${cls}"><svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STEP_ART[key] || ''}</svg></span>`;

const field = (cls, ratio, caption, rv) => `<figure class="field ${cls} ${ratio}${LIGHT.has(cls) ? ' on-light' : ''}"${rv ? ' data-rvf' : ''}>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;

// joined with a real space so screen readers and copy-paste get words, not one long string
const words = arr => arr.map((w, i) => `<span class="wc"><span class="w" style="--i:${i}">${esc(w)}</span></span>`).join(' ');

const label = (text, count) => `<p class="label">${esc(text)}${count ? `<sup>${esc(count)}</sup>` : ''}</p>`;

const acc = (faqs, pre) => `<div class="acc" data-accg>
${faqs.map(([q, a], i) => `  <div class="acc-i">
    <button class="acc-h" type="button" data-acc aria-expanded="false" aria-controls="${pre}${i}">
      <span>${esc(q)}</span><span class="sign" aria-hidden="true"></span>
    </button>
    <div class="acc-p" id="${pre}${i}"><div class="acc-b">${esc(a)}</div></div>
  </div>`).join('\n')}
</div>`;

/* ---------- shell ---------- */

const nav = active => `
  <a class="skip" href="#top">Skip to content</a>
  <header class="nav" data-nav>
    <div class="col nav-in">
      <a class="brand" href="/">RecRoc</a>
      <nav class="nav-links" aria-label="Primary">
        <a href="/services/"${active === 'services' ? ' class="here"' : ''}>Services</a>
        <a href="/process/"${active === 'process' ? ' class="here"' : ''}>Process</a>
        <a href="/about/"${active === 'about' ? ' class="here"' : ''}>About</a>
      </nav>
      <a class="nav-cta" href="/contact/">Start a project ${ic('arrow')}</a>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-label="Open menu" aria-controls="sheet">
        <svg class="m" aria-hidden="true"><use href="#i-menu"/></svg><svg class="x" aria-hidden="true"><use href="#i-close"/></svg>
      </button>
    </div>
  </header>
  <div class="sheet" id="sheet" data-sheet>
    <div class="col">
      <a href="/services/">Services</a>
${site.groups.map(g => `      <p class="grp">${esc(g.name)}</p>
${byGroup(g.id).map(s => `      <a class="sub" href="${url(s)}">${esc(s.name)}</a>`).join('\n')}`).join('\n')}
      <p class="grp">Studio</p>
      <a class="sub" href="/process/">Process</a>
      <a class="sub" href="/about/">About</a>
      <a class="sub" href="/contact/">Start a project</a>
    </div>
  </div>`;

/* ONE ending block. The call to action lives inside the footer, so pages do not
   stack a red band and a dark footer on top of each other. */
const foot = (h, p) => `
  <footer class="foot on-dark">
    <div class="col">
      <div class="foot-cta">
        <h2>${esc(h || 'Tell us what you are making.')}</h2>
        <p>${esc(p || 'You will hear back from the person who would actually run the project, usually within a working day.')}</p>
        <div class="row-actions">
          <a class="btn btn-light" href="/contact/">Start a project ${ic('arrow')}</a>
          <a class="foot-mail" href="mailto:${site.email}">${site.email}</a>
        </div>
      </div>
      <div class="foot-nav">
        <div class="foot-c">
          <p>Services</p>
${site.groups.map(g => `          <a href="/services/#${g.id}">${esc(g.name)}</a>`).join('\n')}
          <a href="/services/">All 23</a>
        </div>
        <div class="foot-c">
          <p>Most requested</p>
${['commercial-advertising-video', 'corporate-event-video', 'business-branding-photography', 'corporate-event-dj'].map(find).filter(Boolean).map(s => `          <a href="${url(s)}">${esc(s.name)}</a>`).join('\n')}
        </div>
        <div class="foot-c">
          <p>Studio</p>
          <a href="/about/">About</a>
          <a href="/process/">Process</a>
          <a href="/contact/">Contact</a>
          <a href="tel:${site.phoneHref}">${site.phone}</a>
        </div>
      </div>
      <div class="foot-base">
        <span>&copy;${new Date().getFullYear()} RecRoc LLC, All Rights Reserved.</span>
        <span>${esc(site.tagline)}</span>
      </div>
    </div>
  </footer>`;

const page = ({ title, desc, canonical, active, body, ld, ctaH, ctaP }) => `<!DOCTYPE html>
<html lang="en">
<head>
<script>document.documentElement.classList.add('js')</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#FFFFFF">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.domain}${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="RecRoc">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.domain}${canonical}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@400;500&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${CSS}">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
</head>
<body>
${sprite()}
${nav(active)}
<main id="top">
${body}
</main>
${foot(ctaH, ctaP)}
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js" defer></script>
<script src="${JS}" defer></script>
</body>
</html>
`;

const write = (rel, html) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
};

module.exports = { site, services, esc, byGroup, find, url, groupName, ic, mk, illus, stepArt, STEP_FIELD, STEP_KEY, words, label, field, acc, page, write, FIELD };

if (require.main === module) require('./pages.js');
