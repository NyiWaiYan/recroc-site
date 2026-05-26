/* ============================================
   RECROC STUDIO — Main Script
   ============================================ */

const state = {
  projects: [],
};

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const escapeHtml = (str) => {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/* ---------- Load data ---------- */
async function loadProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects.json');
    const data = await res.json();
    state.projects = data.projects || [];
    applySiteSettings(data.site || {});
    renderProjects();
    handleDeepLink();
  } catch (err) {
    console.error(err);
    $('#projects-grid').innerHTML = `
      <div style="grid-column: span 12; padding: 60px; text-align: center; color: var(--text-dim);">
        Couldn't load projects. If you opened this file directly (file://), please run a local server. See README.md.
      </div>`;
  }
}

/* ---------- Apply site settings (hero image, eyebrow, etc.) ---------- */
function applySiteSettings(s) {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el && val) el.href = val; };
  const heroBg = $('#hero-bg');
  if (heroBg && s.hero_image) heroBg.style.backgroundImage = `url("${s.hero_image}")`;
  // Logo: image if uploaded, else text
  if (s.logo_image) {
    const logoEl = document.getElementById('logo-text');
    const supEl = document.getElementById('logo-sup');
    if (logoEl) logoEl.outerHTML = `<img src="${s.logo_image}" alt="${s.logo_text || 'Logo'}" style="height:28px;width:auto;display:block;">`;
    if (supEl) supEl.remove();
  } else {
    set('logo-text', s.logo_text);
  }
  set('footer-logo', s.logo_text);
  set('hero-eyebrow', s.hero_eyebrow);
  set('hero-status', s.hero_status);
  set('hero-t1', s.hero_title_1);
  set('hero-t2-em', s.hero_title_2 ? s.hero_title_2.split(' ')[0] : '');
  set('hero-t2', s.hero_title_2 ? s.hero_title_2.split(' ').slice(1).join(' ') : '');
  set('hero-t3', s.hero_title_3);
  set('hero-desc-text', s.hero_desc);
  set('about-lead-text', s.about_lead);
  set('about-body-text', s.about_body);
  set('stat1n', s.stat_1_num); set('stat1l', s.stat_1_label);
  set('stat2n', s.stat_2_num); set('stat2l', s.stat_2_label);
  set('stat3n', s.stat_3_num); set('stat3l', s.stat_3_label);
  set('srv1t', s.service_1_title); set('srv1d', s.service_1_desc);
  set('srv2t', s.service_2_title); set('srv2d', s.service_2_desc);
  set('srv3t', s.service_3_title); set('srv3d', s.service_3_desc);
  set('srv4t', s.service_4_title); set('srv4d', s.service_4_desc);
  set('contact-email-text', s.contact_email);
  if (s.contact_email) { const el = $('#contact-email-link'); if (el) el.href = 'mailto:' + s.contact_email; }
  setHref('soc-ig', s.social_instagram);
  setHref('soc-vim', s.social_vimeo);
  setHref('soc-yt', s.social_youtube);
  setHref('soc-beh', s.social_behance);
  set('footer-location', s.location);
}

/* ---------- Render project cards ---------- */
function renderProjects() {
  const grid = $('#projects-grid');
  grid.innerHTML = state.projects.map((p, i) => `
    <article class="project-card" data-id="${escapeHtml(p.id)}" style="animation: fadeIn 0.8s var(--ease) ${0.2 + i * 0.12}s backwards;">
      <img class="project-cover" src="${escapeHtml(p.cover)}" alt="${escapeHtml(p.title)}" loading="lazy">
      <span class="project-view">View <span>↗</span></span>
      <div class="project-overlay">
        <div class="project-meta">
          <span>${escapeHtml(p.category)}</span>
          <span>${escapeHtml(p.year)}</span>
        </div>
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <p class="project-tagline">${escapeHtml(p.tagline || '')}</p>
      </div>
    </article>
  `).join('');

  $$('.project-card').forEach(card => {
    card.addEventListener('click', () => openProject(card.dataset.id));
  });
}

/* ---------- Modal ---------- */
function buildMediaHtml(media = []) {
  return media.map(m => {
    if (m.type === 'youtube' && m.id) {
      return `<div class="media-item">
        <iframe src="https://www.youtube.com/embed/${escapeHtml(m.id)}?rel=0" 
                title="YouTube video" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>`;
    }
    if (m.type === 'image' && m.url) {
      return `<div class="media-item"><img src="${escapeHtml(m.url)}" alt="" loading="lazy"></div>`;
    }
    return '';
  }).join('');
}

function buildHeroHtml(project) {
  const first = (project.media || [])[0];
  if (first && first.type === 'youtube') {
    return `<iframe src="https://www.youtube.com/embed/${escapeHtml(first.id)}?rel=0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>`;
  }
  return `<img src="${escapeHtml(project.cover)}" alt="${escapeHtml(project.title)}">
          <div class="modal-hero-overlay"></div>`;
}

function openProject(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  const credits = project.credits || {};
  const creditsHtml = Object.keys(credits).filter(k => credits[k]).map(k => `
    <div class="credit-row">
      <span class="credit-key">${escapeHtml(k)}</span>
      <span class="credit-val">${escapeHtml(credits[k])}</span>
    </div>
  `).join('');

  $('#modal-content').innerHTML = `
    <div class="modal-hero">${buildHeroHtml(project)}</div>
    <div class="modal-body">
      <div class="modal-meta">
        <span>${escapeHtml(project.category)}</span>
        <span>${escapeHtml(project.client)}</span>
        <span>${escapeHtml(project.year)}</span>
      </div>
      <h1 class="modal-title">${escapeHtml(project.title)}</h1>
      <p class="modal-tagline">${escapeHtml(project.tagline || '')}</p>
      <div class="modal-grid">
        <div class="modal-description">${escapeHtml(project.description || '')}</div>
        ${Object.keys(credits).filter(k => credits[k]).length ? `
          <div class="modal-credits">
            <div class="modal-credits-title">Credits</div>
            ${creditsHtml}
          </div>
        ` : ''}
      </div>
      <div class="modal-media">${buildMediaHtml(project.media)}</div>
      ${project.external_link ? `
        <div style="margin-top: 60px; text-align: center;">
          <a href="${escapeHtml(project.external_link)}" target="_blank" rel="noopener" class="modal-more-btn">
            <span>See more details</span>
            <span class="arrow">↗</span>
          </a>
        </div>
      ` : ''}
    </div>
  `;

  $('#project-modal').classList.add('active');
  $('#project-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#modal-content').scrollTop = 0;

  history.replaceState(null, '', `#project=${encodeURIComponent(id)}`);
}

function closeModal() {
  $('#project-modal').classList.remove('active');
  $('#project-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  $('#modal-content').innerHTML = '';

  if (location.hash.startsWith('#project=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

/* ---------- Deep linking ---------- */
function handleDeepLink() {
  const m = location.hash.match(/^#project=(.+)$/);
  if (m) {
    const id = decodeURIComponent(m[1]);
    openProject(id);
  }
}

/* ---------- Event listeners ---------- */
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]') || e.target.closest('[data-close]')) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

window.addEventListener('hashchange', handleDeepLink);

$('#year').textContent = new Date().getFullYear();

loadProjects();
