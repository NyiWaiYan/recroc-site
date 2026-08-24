const B = require('./build.js');
const { site, services, esc, byGroup, find, url, groupName, ic, mk, words, label, field, acc, page, write, FIELD } = B;

const FIELDS = ['f-ink', 'f-steel', 'f-red', 'f-sand', 'f-stone', 'f-mist'];

/* ================================ HOME ================================ */
{
  const h = site.home;
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(h.headline)}</h1>
    <p class="lede" data-rv style="--i:1">${esc(h.sub)}</p>
    <div class="row-actions" data-rv style="--i:2">
      <a class="btn btn-red" href="/contact/">Start a project ${ic('arrow')}</a>
      <a class="btn btn-soft" href="/services/">See what we do</a>
    </div>
    <div class="facts" data-rv style="--i:3">
${h.meta.map(([k, v]) => `      <span>${esc(k)} <b>${esc(v)}</b></span>`).join('\n')}
    </div>
  </section>

  <section class="col s-xs t-0">
    <figure class="field r-cine" data-rvf>
      <img src="/images/bts-interview.jpg" alt="RecRoc crew filming a seated interview with a cinema camera and boom microphone" width="1920" height="1280" fetchpriority="high">
    </figure>
  </section>

  <section class="col s-md">
    <div class="head" data-rv>
      ${label('Recent work')}
      <h2 class="d3">Film and photography for people with something to say.</h2>
    </div>
    <div class="strip" data-lenis-prevent>
${[['f-ink','Commercial','Brand film'],['f-steel','Event coverage','Conference'],['f-red','Live DJ set','Campus formal'],['f-sand','Brand identity','Full system'],['f-mist','Product','Studio'],['f-stone','Artist portrait','Single release']].map(function(x, i){
  return `      <a class="shot" href="/services/" data-rv style="--i:${i}">
        <p class="shot-cap">${x[1]} <span style="color:var(--faint)">/ ${x[2]}</span></p>
        ${field(x[0], 'r-tall', '')}
      </a>`;
}).join('\n')}
    </div>
    <p class="note" style="margin-top:var(--s5)">Client work replaces these as projects wrap.</p>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>
      ${label('What we do', '23')}
      <h2 class="d3">Visual and audio, one studio.</h2>
      <p class="soft">${esc(site.servicesPage.sub)}</p>
    </div>
    <div class="list">
${site.groups.map((g, i) => `      <a class="item" href="/services/#${g.id}" data-rv style="--i:${i}">
        <span class="item-top">
          <span class="item-name">${mk(g.id)}${esc(g.name)}</span>
          <span class="item-go">${ic('arrow')}</span>
        </span>
        <span class="item-note">${esc(g.blurb)}</span>
      </a>`).join('\n')}
    </div>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('Why us')}<h2 class="d3">Three things most studios cannot say.</h2></div>
    <div class="stack">
${h.pillars.map((p, i) => `      <div class="point" data-rv style="--i:${i}">
        <span class="k">${esc(p.k)}</span>
        <h3>${esc(p.t)}</h3>
        <p>${esc(p.d)}</p>
      </div>`).join('\n')}
    </div>
  </section>

  <section class="col s-sm t-0">
    <div class="head" data-rv>${label('How it goes', '5 steps')}<h2 class="d3">Simple from start to finish.</h2></div>
    <div class="flow" data-rv>
${site.process.steps.map((s, i) => `      <span>${esc(s.t)}</span>${i < 4 ? '<i>/</i>' : ''}`).join('\n')}
    </div>
    <p style="margin-top:var(--s6)" data-rv><a class="lnk" href="/process/">Walk through the process ${ic('arrow')}</a></p>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('Questions')}<h2 class="d3">Things people ask first.</h2></div>
    <div data-rv>${acc(site.globalFaqs.map(f => [f.q, f.a]), 'g')}</div>
  </section>`;

  write('index.html', page({
    title: h.title, desc: h.description, canonical: '/', active: 'home', body,
    ld: {
      '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'RecRoc',
      description: h.description, url: site.domain, email: site.email, telephone: site.phone,
      slogan: site.tagline,
      address: { '@type': 'PostalAddress', addressRegion: 'ND', addressCountry: 'US' },
      areaServed: ['North Dakota', 'United States'],
      makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: site.domain + url(s) } }))
    }
  }));
}

/* ============================ SERVICES HUB ============================ */
{
  const sp = site.servicesPage;
  let n = 0;
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(['Everything', 'we', 'make.'])}</h1>
    <p class="lede" data-rv style="--i:1">${esc(sp.sub)}</p>
  </section>

  <section class="col b-0" data-rv>
    <div class="pills" data-filters>
      <button class="pill" type="button" data-f="all" aria-pressed="true">All <span>23</span></button>
${site.groups.map(g => `      <button class="pill" type="button" data-f="${g.id}" aria-pressed="false">${esc(g.name)} <span>${byGroup(g.id).length}</span></button>`).join('\n')}
    </div>
  </section>

  <section class="col s-sm">
${site.groups.map(g => {
    const list = byGroup(g.id);
    const auds = ['business', 'artist', 'personal'].filter(a => list.some(s => s.audience === a));
    return `    <div id="${g.id}" data-grp="${g.id}" style="scroll-margin-top:calc(var(--nav-h) + 16px)">
      <div class="group-h"><h2>${mk(g.id)}${esc(g.name)}</h2><span>${list.length} ${list.length === 1 ? 'service' : 'services'}</span></div>
      <div class="list">
${auds.map(a => `        <p class="sub-h">${esc(site.audiences[a])}</p>
${list.filter(s => s.audience === a).map(s => { n++; return `        <a class="item" href="${url(s)}">
          <span class="item-top"><span class="item-name">${esc(s.name)}</span><span class="item-go">${ic('arrow')}</span></span>
          <span class="item-note">${esc(s.short)}</span>
        </a>`; }).join('\n')}`).join('\n')}
      </div>
    </div>`;
  }).join('\n')}
  </section>`;

  write('services/index.html', page({
    title: sp.title, desc: sp.description, canonical: '/services/', active: 'services', body,
    ctaH: 'Not sure which one you need?',
    ctaP: 'Describe the outcome you are after and we will tell you which services get you there, including the ones you can skip.',
    ld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Services', url: site.domain + '/services/', hasPart: services.map(s => ({ '@type': 'Service', name: s.name, url: site.domain + url(s) })) }
  }));
}

/* ========================== SERVICE DETAIL x23 ======================== */
services.forEach((s, idx) => {
  const rel = (s.related || []).map(find).filter(Boolean);
  const claim = s.group === 'audio'
    ? ['Human made', 'Every note is written for one client. Stock libraries and AI tracks put <b>the same music behind your competitor</b>, and we will not do that to you.']
    : s.group === 'dj'
      ? ['Live, not pressed play', 'Our DJs perform on industry controllers, <b>mixing and reading the room</b> in real time. A different job from running a playlist.']
      : ['Direct access', 'No account managers between you and the crew. <b>The person on the call</b> is the person on set.'];

  const body = `
  <section class="col hero">
    <p class="label"><a href="/services/">Services</a> <span style="color:var(--faint)">/</span> ${esc(groupName(s.group))}</p>
    <h1 class="d1 in">${words(s.name.split(' '))}</h1>
    <p class="lede" data-rv style="--i:1">${esc(s.promise)}</p>
    <div class="row-actions" data-rv style="--i:2">
      <a class="btn btn-red" href="/contact/?s=${encodeURIComponent(groupName(s.group))}">Start a project ${ic('arrow')}</a>
    </div>
  </section>

  <section class="col s-xs t-0">
    ${field(FIELD[s.group] || FIELDS[idx % 6], 'r-cine', s.name, true)}
  </section>

  <section class="col s-md">
    <div class="prose" data-rv>
${s.overview.map((p, i) => `      <p class="${i === 0 ? 'lede' : ''}">${esc(p)}</p>`).join('\n')}
    </div>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('What it covers', String(s.includes.length))}<h2 class="d3">${esc(s.short)}</h2></div>
    <div class="defs">
${s.includes.map(([t, d], i) => `      <div class="def" data-rv style="--i:${i}"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('\n')}
    </div>
  </section>

  <section class="col s-sm t-0">
    <div data-rv>
      <p class="label">${esc(claim[0])}</p>
      <p class="pull">${claim[1]}</p>
    </div>
  </section>

  ${s.faqs && s.faqs.length ? `<section class="col s-md t-0">
    <div class="head" data-rv>${label('Questions', String(s.faqs.length))}<h2 class="d3">Before you ask.</h2></div>
    <div data-rv>${acc(s.faqs, 'f')}</div>
  </section>` : ''}

  ${rel.length ? `<section class="col s-md t-0">
    <div class="head" data-rv>${label('Often booked together')}<h2 class="d3">Most clients pair this with one of these.</h2></div>
    <div class="list">
${rel.map((r, i) => `      <a class="item" href="${url(r)}" data-rv style="--i:${i}">
        <span class="item-top"><span class="item-name">${esc(r.name)}</span><span class="item-go">${ic('arrow')}</span></span>
        <span class="item-note">${esc(r.short)}</span>
      </a>`).join('\n')}
    </div>
  </section>` : ''}`;

  write(`services/${s.slug}/index.html`, page({
    title: `${s.name} | RecRoc`, desc: s.meta, canonical: url(s), active: 'services', body,
    ctaH: 'Ready to start?',
    ctaP: `Tell us about the project and roughly when you need it. ${s.name} enquiries go straight to the team who would run it.`,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Service', name: s.name, description: s.meta, serviceType: groupName(s.group), url: site.domain + url(s), provider: { '@type': 'LocalBusiness', name: 'RecRoc', url: site.domain, telephone: site.phone, email: site.email }, areaServed: ['North Dakota', 'United States'] },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'RecRoc', item: site.domain + '/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: site.domain + '/services/' },
          { '@type': 'ListItem', position: 3, name: s.name, item: site.domain + url(s) }] }
      ].concat(s.faqs && s.faqs.length ? [{ '@type': 'FAQPage', mainEntity: s.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : [])
    }
  }));
});

/* =============================== ABOUT =============================== */
{
  const a = site.about;
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(a.headline)}</h1>
    <p class="lede" data-rv style="--i:1">${esc(a.sub)}</p>
  </section>

  <section class="col s-xs t-0">
    <div class="grid-3" data-rv>
      ${field('f-ink', 'r-box', 'On set')}
      ${field('f-steel', 'r-box', 'The room')}
      ${field('f-sand', 'r-box', 'The kit')}
    </div>
  </section>

  <section class="col s-md">
    <div class="prose" data-rv>
${a.body.map((p, i) => `      <p class="${i === 0 ? 'lede' : ''}">${esc(p)}</p>`).join('\n')}
    </div>
  </section>

  <section class="col s-sm t-0">
    <div data-rv><p class="label">Mission</p><p class="pull">${esc(a.mission)}</p></div>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('Why RecRoc', '3')}<h2 class="d3">Direct access to the makers.</h2></div>
    <div class="stack">
${a.why.map((w, i) => `      <div class="point" data-rv style="--i:${i}"><h3>${esc(w.t)}</h3><p>${esc(w.d)}</p></div>`).join('\n')}
    </div>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('Values', '4')}<h2 class="d3">What we hold to.</h2></div>
    <div class="defs">
${a.values.map((v, i) => `      <div class="def" data-rv style="--i:${i}"><b>${esc(v.t)}</b><span>${esc(v.d)}</span></div>`).join('\n')}
    </div>
  </section>`;

  write('about/index.html', page({ title: a.title, desc: a.description, canonical: '/about/', active: 'about', body,
    ctaH: 'Work with the people who make it.',
    ld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About RecRoc', url: site.domain + '/about/', description: a.description } }));
}

/* ============================== PROCESS ============================== */
{
  const p = site.process;
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(p.headline)}</h1>
    <p class="lede" data-rv style="--i:1">${esc(p.sub)}</p>
  </section>

  <section class="col s-xs t-0">
    <ol class="steps">
${p.steps.map((s, i) => `      <li class="step" data-rv style="--i:${i}">
        <p class="step-n">${s.n}</p>
        <div>
          <h2>${esc(s.t)}</h2>
          <p>${esc(s.d)}</p>
        </div>
      </li>`).join('\n')}
    </ol>
  </section>

  <section class="col s-sm">
    <div data-rv><p class="label">In practice</p><p class="pull">You always know which step you are on, what comes next, and who to call. <b>No silent weeks.</b></p></div>
  </section>`;

  write('process/index.html', page({ title: p.title, desc: p.description, canonical: '/process/', active: 'process', body,
    ctaH: 'Start at step one.',
    ctaP: 'The first conversation is short, free, and honest about whether we are the right studio for the job.',
    ld: { '@context': 'https://schema.org', '@type': 'HowTo', name: 'The RecRoc process', description: p.description, step: p.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.d })) } }));
}

/* ============================== CONTACT ============================== */
{
  const c = site.contact;
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(['Tell', 'us', 'what', 'you', 'are', 'making.'])}</h1>
    <p class="lede" data-rv style="--i:1">${esc(c.sub)}</p>
    <div class="facts" data-rv style="--i:2">
      <span>Email <b><a href="mailto:${site.email}">${site.email}</a></b></span>
      <span>Phone <b><a href="tel:${site.phoneHref}">${site.phone}</a></b></span>
      <span>Based <b>${esc(site.region)}</b></span>
    </div>
  </section>

  <section class="col s-sm t-0">
    <form class="form" name="project" method="POST" data-netlify="true" netlify-honeypot="company-website" action="/thanks/" data-form data-rv>
      <input type="hidden" name="form-name" value="project">
      <p class="hp" aria-hidden="true"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>
      <div class="f">
        <label for="t">What is it about</label>
        <div class="sel">
          <select id="t" name="topic" required data-preselect>
            <option value="" disabled selected>Choose one</option>
${site.groups.map(g => `            <option>${esc(g.name)}</option>`).join('\n')}
            <option>Something else</option>
          </select>${ic('chev')}
        </div>
      </div>
      <div class="f"><label for="n">Name</label><input id="n" name="name" type="text" placeholder="Your name" required autocomplete="name"></div>
      <div class="f"><label for="e">Email</label><input id="e" name="email" type="email" placeholder="you@company.com" required autocomplete="email"></div>
      <div class="f"><label for="m">About the project</label><textarea id="m" name="message" rows="4" placeholder="What are you making, and when do you need it?" required></textarea></div>
      <button class="btn btn-red" type="submit" style="justify-self:start">Send it over ${ic('arrow')}</button>
    </form>
  </section>

  <section class="col s-md t-0">
    <div class="head" data-rv>${label('Before you write', '6')}<h2 class="d3">Common questions.</h2></div>
    <div data-rv>${acc(site.globalFaqs.map(f => [f.q, f.a]), 'c')}</div>
  </section>`;

  write('contact/index.html', page({ title: c.title, desc: c.description, canonical: '/contact/', active: 'contact', body,
    ctaH: 'Prefer to just call?',
    ctaP: `Phone ${site.phone}. You get the studio, not a switchboard.`,
    ld: { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Start a project', url: site.domain + '/contact/' } }));
}

/* ============================== THANKS =============================== */
{
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(['Got', 'it.', 'Talk', 'soon.'])}</h1>
    <p class="lede" data-rv style="--i:1">Your message is with the team. You will normally hear back within a working day, from the person who would actually run the project.</p>
    <div class="row-actions" data-rv style="--i:2">
      <a class="btn btn-soft" href="/services/">Browse services</a>
      <a class="btn btn-soft" href="/process/">What happens next</a>
    </div>
  </section>`;
  write('thanks/index.html', page({ title: 'Thank you | RecRoc', desc: 'Your message has been received.', canonical: '/thanks/', active: '', body, ctaH: 'Something urgent?', ctaP: `Call ${site.phone} and you will get the studio directly.` }));
}

/* ================================ 404 ================================ */
{
  const body = `
  <section class="col hero">
    <h1 class="d1 in">${words(['No', 'signal', 'here.'])}</h1>
    <p class="lede" data-rv style="--i:1">That page does not exist. It may have moved, or the link may be wrong.</p>
    <div class="row-actions" data-rv style="--i:2">
      <a class="btn btn-red" href="/services/">All 23 services ${ic('arrow')}</a>
      <a class="btn btn-soft" href="/">Home</a>
    </div>
  </section>`;
  write('404.html', page({ title: 'Page not found | RecRoc', desc: 'That page could not be found.', canonical: '/404.html', active: '', body }));
}

/* ========================== sitemap + robots ========================= */
{
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/services/', '/process/', '/about/', '/contact/'].concat(services.map(url));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${site.domain}${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : u.split('/').length > 3 ? '0.7' : '0.9'}</priority></url>`).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
}

console.log(`built ${services.length} service pages + 7 core pages`);
