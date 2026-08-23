#!/usr/bin/env node
/* RecRoc static site generator.
   Reads content/*.json, writes plain HTML. Netlify serves the output
   directly; there is no build step on deploy. Run: npm run build */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/services.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byGroup = id => services.filter(s => s.group === id);
const find = slug => services.find(s => s.slug === slug);
const url = s => `/services/${s.slug}/`;

/* ---------------- icons (24px grid, 1.5 stroke, drawn for RecRoc) ------------- */
const ICONS = {
  video: '<rect x="2.2" y="6" width="12.8" height="12" rx="3"/><path d="M15 10.6l4.9-2.8c.7-.4 1.6.1 1.6.9v6.6c0 .8-.9 1.3-1.6.9L15 13.4z"/>',
  camera: '<path d="M3 8.6A2.6 2.6 0 0 1 5.6 6h1.1a2 2 0 0 0 1.7-1l.6-1a1.5 1.5 0 0 1 1.3-.7h3.4a1.5 1.5 0 0 1 1.3.7l.6 1a2 2 0 0 0 1.7 1h1.1A2.6 2.6 0 0 1 21 8.6v7.8A2.6 2.6 0 0 1 18.4 19H5.6A2.6 2.6 0 0 1 3 16.4z"/><circle cx="12" cy="12.4" r="3.4"/>',
  identity: '<circle cx="9.4" cy="9.4" r="6.4"/><circle cx="14.6" cy="14.6" r="6.4"/>',
  deck: '<path d="M6 3v6.2M6 13.8V21M12 3v2.2M12 9.8V21M18 3v10.2M18 17.8V21"/><path d="M3.6 11.5h4.8M9.6 7.5h4.8M15.6 15.5h4.8"/>',
  wave: '<path d="M3 10v4M7.5 6.4v11.2M12 3v18M16.5 7.4v9.2M21 10.4v3.2"/>',
  arrow: '<path d="M4 12h15M13.6 6.4 19.5 12l-5.9 5.6"/>',
  chev: '<path d="m6 9.4 6 5.9 6-5.9"/>',
  upright: '<path d="M7.2 16.8 16.8 7.2M8.6 7.2h8.2v8.2"/>',
  menu: '<path d="M3.5 7.5h17M3.5 12h17M3.5 16.5h17"/>',
  close: '<path d="m6.6 6.6 10.8 10.8M17.4 6.6 6.6 17.4"/>',
  image: '<rect x="3" y="4.6" width="18" height="14.8" rx="2.6"/><circle cx="8.6" cy="10" r="1.5"/><path d="m3.6 17.6 4.7-4.2a2 2 0 0 1 2.7 0l4.2 3.8M14.2 14.1l1.6-1.4a2 2 0 0 1 2.7 0l2 1.8"/>',
  play: '<path d="M8.4 5.6v12.8L19 12z"/>'
};
const sprite = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">` +
  Object.keys(ICONS).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${ICONS[k]}</symbol>`).join('') +
  `</svg>`;
const ic = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

/* ---------------- fragments ---------------- */

const words = (arr, accent) => {
  let i = 0;
  return arr.map(w =>
    `<span class="wclip"><span class="word${accent === i ? ' accent' : ''}" style="--i:${i++}">${esc(w)}</span></span>`
  ).join('');
};

const eyebrow = (label, count) =>
  `<p class="eyebrow">${esc(label)}${count ? ` <span class="slash">/</span> ${esc(count)}` : ''}</p>`;

const ph = (ratio, label, icon) => `
      <div class="ph ${ratio}">
        <div class="ph-stack">
          ${ic(icon || 'image', 'ic-lg')}
          <span class="ph-label">${esc(label)}</span>
        </div>
      </div>`;

/* the signature: viewfinder monitor. Wraps a photo or a placeholder. */
const monitor = (inner, osd, rv) => `
    <figure class="monitor"${rv ? ' data-rv-img' : ''}>
      ${inner}
      <span class="mk-a"></span><span class="mk-b"></span>
      <span class="monitor-osd"><i class="rec-dot"></i>${esc(osd || 'REC')}</span>
      <span class="monitor-tc" data-tc-live>00:00:00:00</span>
    </figure>`;

const rule = () => `<div class="rule"></div>`;

const shead = (label, count, titleWords, accent, aside, tag) => `
      <header class="shead">
        <div class="shead-title">
          ${eyebrow(label, count)}
          <${tag || 'h2'} class="h1" data-rv data-words>${words(titleWords, accent)}</${tag || 'h2'}>
        </div>
        ${aside ? `<div class="shead-aside" data-rv style="--i:1"><p class="lede">${aside}</p></div>` : ''}
      </header>`;

const faqBlock = (faqs, idPrefix) => `
      <div class="acc" data-acc-group>
${faqs.map(([q, a], i) => `        <div class="acc-item">
          <button class="acc-head" type="button" data-acc aria-expanded="false" aria-controls="${idPrefix}-${i}">
            <span>${esc(q)}</span><span class="acc-sign" aria-hidden="true"></span>
          </button>
          <div class="acc-panel" id="${idPrefix}-${i}">
            <div class="acc-body"><p class="body-soft">${esc(a)}</p></div>
          </div>
        </div>`).join('\n')}
      </div>`;

const ctaBand = (headline, accent, sub) => `
  <section class="cta on-red" id="start">
    <div class="wrap sec">
      <header class="shead">
        <div class="shead-title">
          ${eyebrow('Start a project')}
          <h2 class="h1" data-rv data-words>${words(headline, accent)}</h2>
        </div>
        <div class="shead-aside" data-rv style="--i:1"><p class="lede">${esc(sub)}</p></div>
      </header>

      <div class="cta-grid">
        <div data-rv>
          <p class="lede">Reach us directly. No form gate, no account manager, no queue.</p>
          <div class="cta-lines">
            <a class="cta-line" href="mailto:${site.email}">
              <span class="cta-line-k">Email</span><span class="cta-line-v">${site.email}</span>
            </a>
            <a class="cta-line" href="tel:${site.phoneHref}">
              <span class="cta-line-k">Phone</span><span class="cta-line-v">${site.phone}</span>
            </a>
            <div class="cta-line">
              <span class="cta-line-k">Based</span><span class="cta-line-v">${site.region}</span>
            </div>
          </div>
        </div>

        <form class="form" name="project" method="POST" data-netlify="true" netlify-honeypot="company-website" action="/thanks/" data-form data-rv style="--i:1">
          <input type="hidden" name="form-name" value="project">
          <p class="hp" aria-hidden="true"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>
          <div class="field">
            <label for="f-topic">I am reaching out about</label>
            <div class="sel">
              <select id="f-topic" name="topic" required data-preselect>
                <option value="" disabled selected>Choose one</option>
${site.groups.map(g => `                <option>${esc(g.name)}</option>`).join('\n')}
                <option>Something else</option>
              </select>
              ${ic('chev')}
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-name">Name</label>
              <input id="f-name" name="name" type="text" placeholder="Your name" required autocomplete="name">
            </div>
            <div class="field">
              <label for="f-email">Email</label>
              <input id="f-email" name="email" type="email" placeholder="you@company.com" required autocomplete="email">
            </div>
          </div>
          <div class="field">
            <label for="f-msg">About the project</label>
            <textarea id="f-msg" name="message" rows="4" placeholder="What are you making, and when do you need it?" required></textarea>
          </div>
          <button class="btn btn-onred form-submit" type="submit">Send it over ${ic('arrow')}</button>
        </form>
      </div>
    </div>
  </section>`;

/* ---------------- nav + shell ---------------- */

const megaPanel = () => `
  <div class="mega" data-mega>
    <div class="wrap">
      <div class="mega-grid">
${site.groups.map((g, i) => `        <div class="mega-col" style="--i:${i}">
          <p class="mega-head"><strong>${esc(g.name)}</strong><span>${String(byGroup(g.id).length).padStart(2, '0')}</span></p>
${byGroup(g.id).map(s => `          <a class="mega-link" href="${url(s)}">${esc(s.name)}</a>`).join('\n')}
        </div>`).join('\n')}
      </div>
      <div class="mega-foot">
        <p class="mono">23 services / visual and audio under one roof</p>
        <a class="tlink" href="/services/">All services ${ic('arrow')}</a>
      </div>
    </div>
  </div>`;

const sheetPanel = () => `
  <div class="sheet" id="sheet" data-sheet>
    <div class="wrap">
      <button class="sheet-row" type="button" data-sheet-toggle aria-expanded="false" aria-controls="sh-svc">
        Services ${ic('chev')}
      </button>
      <div class="sheet-sub" id="sh-svc">
${site.groups.map(g => `        <p class="sheet-grp">${esc(g.name)}</p>
${byGroup(g.id).map(s => `        <a href="${url(s)}">${esc(s.name)}</a>`).join('\n')}`).join('\n')}
        <p class="sheet-grp">Overview</p>
        <a href="/services/">All 23 services</a>
      </div>
      <a class="sheet-row" href="/process/">Process ${ic('upright')}</a>
      <a class="sheet-row" href="/about/">About ${ic('upright')}</a>
      <a class="sheet-row" href="/contact/">Contact ${ic('upright')}</a>
      <a class="btn btn-red sheet-cta" href="/contact/"><i class="rec"></i> Start a project</a>
    </div>
  </div>`;

const navBar = active => `
  <a class="skip" href="#top">Skip to content</a>
  <div class="prog" data-prog></div>
  <header class="nav" data-nav>
    <div class="wrap nav-in">
      <a class="brand" href="/">RecRoc<span class="brand-dot"></span></a>
      <nav aria-label="Primary">
        <ul class="nav-links">
          <li class="nav-has-mega" data-mega-wrap>
            <a class="nav-link${active === 'services' ? ' is-here' : ''}" href="/services/" data-mega-btn aria-expanded="false">Services ${ic('chev')}</a>
          </li>
          <li><a class="nav-link${active === 'process' ? ' is-here' : ''}" href="/process/">Process</a></li>
          <li><a class="nav-link${active === 'about' ? ' is-here' : ''}" href="/about/">About</a></li>
          <li><a class="nav-link${active === 'contact' ? ' is-here' : ''}" href="/contact/">Contact</a></li>
        </ul>
      </nav>
      <a class="btn btn-red nav-cta" href="/contact/"><i class="rec"></i> Start a project</a>
      <button class="nav-burger" type="button" data-burger aria-expanded="false" aria-label="Open menu" aria-controls="sheet">
        ${ic('menu', 'ic-open')}${ic('close', 'ic-shut')}
      </button>
    </div>
  </header>
  ${megaPanel()}
  ${sheetPanel()}`;

const POPULAR = ['commercial-advertising-video','corporate-event-video','business-branding-photography','corporate-event-dj','brand-identity'];
const footer = () => `
  <footer class="foot">
    <div class="wrap">
      <div class="foot-top">
        <div>
          <p class="foot-brand">RecRoc</p>
          <p class="foot-tag">${esc(site.tagline)}</p>
        </div>
        <nav class="foot-nav" aria-label="Footer">
          <div class="foot-col">
            <p class="foot-col-h">Services</p>
${site.groups.map(g => `            <a href="/services/#${g.id}">${esc(g.name)}</a>`).join('\n')}
            <a href="/services/">All 23 services</a>
          </div>
          <div class="foot-col">
            <p class="foot-col-h">Most requested</p>
${POPULAR.map(find).filter(Boolean).map(s => `            <a href="${url(s)}">${esc(s.name)}</a>`).join('\n')}
          </div>
          <div class="foot-col">
            <p class="foot-col-h">Studio</p>
            <a href="/about/">About</a>
            <a href="/process/">Our process</a>
            <a href="/contact/">Start a project</a>
            <a href="mailto:${site.email}">${site.email}</a>
            <a href="tel:${site.phoneHref}">${site.phone}</a>
          </div>
        </nav>
      </div>
      <div class="foot-base">
        <span>&copy; ${new Date().getFullYear()} RecRoc. ${esc(site.region)}, USA.</span>
        <span>Video / Photography / Brand / DJ / Audio</span>
      </div>
    </div>
  </footer>`;

const page = ({ title, desc, canonical, active, body, ld }) => `<!DOCTYPE html>
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
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
</head>
<body>
${sprite()}
${navBar(active)}
<main id="top">
${body}
</main>
${footer()}
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js" defer></script>
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;

const write = (rel, html) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
};

module.exports = { site, services, esc, byGroup, find, url, ic, words, eyebrow, ph, monitor, rule, shead, faqBlock, ctaBand, page, write, sprite };

if (require.main === module) require('./pages.js');
