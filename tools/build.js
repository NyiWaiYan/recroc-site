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

/* only functional icons remain — no decorative strokes */
const ICONS = {
  arrow: '<path d="M4.5 12h14M13.2 6.6 18.8 12l-5.6 5.4"/>',
  chev: '<path d="m6.5 9.5 5.5 5.4 5.5-5.4"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="m7 7 10 10M17 7 7 17"/>'
};
/* Filled geometric marks, one per discipline. Solid shapes rather than outlined
   icons: they read as index marks, stay legible at 13px, and carry the brand
   red through the page as a system instead of a single button. */
const MARKS = {
  video: '<path d="M5.2 3 13.4 8 5.2 13z"/>',
  photography: '<circle cx="8" cy="8" r="4.7"/>',
  brand: '<path d="M8 2.6 13.4 8 8 13.4 2.6 8z"/>',
  dj: '<rect x="2.8" y="4" width="10.4" height="2.4" rx="1.2"/><rect x="2.8" y="9.6" width="10.4" height="2.4" rx="1.2"/>',
  audio: '<rect x="2.6" y="9.2" width="2.4" height="3.9" rx="1.2"/><rect x="6.8" y="6.1" width="2.4" height="7" rx="1.2"/><rect x="11" y="2.9" width="2.4" height="10.2" rx="1.2"/>'
};
const sprite = () => `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">` +
  Object.keys(ICONS).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</symbol>`).join('') +
  Object.keys(MARKS).map(k => `<symbol id="m-${k}" viewBox="0 0 16 16" fill="currentColor">${MARKS[k]}</symbol>`).join('') +
  `</svg>`;
const ic = n => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
const mk = n => `<svg class="mk" aria-hidden="true"><use href="#m-${n}"/></svg>`;

/* colour fields, assigned per group so the palette stays deliberate */
const FIELD = { video: 'f-ink', photography: 'f-steel', brand: 'f-sand', dj: 'f-red', audio: 'f-stone' };
const LIGHT = new Set(['f-sand', 'f-mist', 'f-stone']);

const field = (cls, ratio, caption, rv) => `<figure class="field ${cls} ${ratio}${LIGHT.has(cls) ? ' on-light' : ''}"${rv ? ' data-rvf' : ''}>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;

const words = arr => arr.map((w, i) => `<span class="wc"><span class="w" style="--i:${i}">${esc(w)}</span></span>`).join('');

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
  <div class="prog" aria-hidden="true"></div>
  <header class="nav" data-nav>
    <div class="col nav-in">
      <a class="brand" href="/">RecRoc</a>
      <nav class="nav-links" aria-label="Primary">
        <a href="/services/"${active === 'services' ? ' class="here"' : ''}>Services</a>
        <a href="/process/"${active === 'process' ? ' class="here"' : ''}>Process</a>
        <a href="/about/"${active === 'about' ? ' class="here"' : ''}>About</a>
      </nav>
      <a class="btn btn-quiet nav-cta" href="/contact/">Start a project</a>
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
        <span>&copy; ${new Date().getFullYear()} RecRoc, ${esc(site.region)}</span>
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

module.exports = { site, services, esc, byGroup, find, url, groupName, ic, mk, words, label, field, acc, page, write, FIELD };

if (require.main === module) require('./pages.js');
