/* Page bodies. Required by build.js. */
const fs = require('fs');
const path = require('path');
const B = require('./build.js');
const { site, services, esc, byGroup, find, url, ic, words, eyebrow, ph, monitor, rule, shead, faqBlock, ctaBand, page, write } = B;

const ROOT = path.join(__dirname, '..');
const groupName = id => site.groups.find(g => g.id === id).name;
const groupIcon = id => site.groups.find(g => g.id === id).icon;

/* =============================== HOME =============================== */
{
  const h = site.home;
  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Media production and DJ', site.region)}
        <h1 class="display hero-title" data-words>${words(h.headline, h.accentIndex)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1">
            <p class="lede">${esc(h.sub)}</p>
          </div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/contact/">Start a project ${ic('arrow')}</a>
            <a class="btn btn-line" href="/services/">See all 23 services</a>
          </div>
        </div>
        <dl class="hero-meta" data-rv style="--i:3">
${h.meta.map(([k, v]) => `          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
        </dl>
      </div>

      <div class="hero-monitor">
        ${monitor(`<img src="/images/bts-interview.jpg" alt="RecRoc crew filming a seated interview with a cinema camera and boom microphone" width="1920" height="1280" fetchpriority="high" style="aspect-ratio:21/9">`, 'REC', true)}
        <div class="hero-cap"><span>${esc(h.caption[0])}</span><span>${esc(h.caption[1])}</span></div>
      </div>
    </div>
  </section>

  <div class="wrap">${rule()}</div>

  <section class="sec">
    <div class="wrap">
      ${shead('Services', '23', site.servicesPage.headline, site.servicesPage.accentIndex, esc(site.servicesPage.sub))}
      <div class="idx">
${site.groups.map((g, i) => {
    const n = byGroup(g.id).length;
    return `        <a class="row" href="/services/#${g.id}" data-rv style="--i:${i}">
          <span class="row-no">${String(i + 1).padStart(2, '0')}</span>
          <span class="row-name">${esc(g.name)}</span>
          <span class="row-desc">${esc(g.blurb)}</span>
          <span class="row-go">${ic('arrow')}</span>
        </a>`;
  }).join('\n')}
      </div>
      <p style="margin-top:26px" data-rv><a class="tlink" href="/services/">Browse every service ${ic('arrow')}</a></p>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="pillars">
${h.pillars.map((p, i) => `        <div class="pillar" data-rv style="--i:${i}">
          <p class="pillar-k">${esc(p.k)}</p>
          <h3 class="h3">${esc(p.t)}</h3>
          <p class="body-soft">${esc(p.d)}</p>
        </div>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="claim" data-rv>
        <p class="eyebrow">Why RecRoc</p>
        <div>
          <p class="claim-t">Most studios put account managers between you and the work. <em>We do not.</em> You talk to the filmmaker, the DJ, the composer, and every project is built from nothing rather than pulled off a shelf.</p>
          <p style="margin-top:22px"><a class="tlink" href="/about/">More about the studio ${ic('arrow')}</a></p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="hero-lower" style="align-items:center;gap:clamp(24px,4vw,64px)">
        ${monitor(`<img src="/images/camera-red.jpg" alt="Studio cinema camera on a RecRoc red field" width="1000" height="1000" loading="lazy" style="aspect-ratio:1/1">`, 'A / CAM', true)}
        <div data-rv style="--i:1">
          ${eyebrow('The kit and the crew')}
          <h2 class="h1" style="margin:20px 0 18px">Owned, not rented.</h2>
          <p class="lede">Cinema bodies, fast glass, FAA Part 107 certified drone pilots, professional DJ controllers and a production room for scoring. The people who specify the gear are the people who show up with it.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${shead('Process', '05', site.process.headline, site.process.accentIndex, esc(site.process.sub))}
      <div class="pstrip">
${site.process.steps.map((s, i) => `        <div class="pstrip-i" data-rv style="--i:${i}">
          <p class="pstrip-n">${s.n}</p>
          <h3 class="h3">${esc(s.t)}</h3>
        </div>`).join('\n')}
      </div>
      <p style="margin-top:26px" data-rv><a class="tlink" href="/process/">Walk through the process ${ic('arrow')}</a></p>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      ${shead('Questions', '06', ['Good', 'questions.'], 1, 'Not here? Email us and the reply comes from the person who would run the project.')}
      ${faqBlock(site.globalFaqs.map(f => [f.q, f.a]), 'gq')}
    </div>
  </section>

${ctaBand(site.contact.headline, site.contact.accentIndex, site.contact.sub)}`;

  write('index.html', page({
    title: h.title, desc: h.description, canonical: '/', active: 'home', body,
    ld: {
      '@context': 'https://schema.org', '@type': 'LocalBusiness',
      name: 'RecRoc', description: h.description, url: site.domain,
      email: site.email, telephone: site.phone,
      slogan: site.tagline,
      address: { '@type': 'PostalAddress', addressRegion: 'ND', addressCountry: 'US' },
      areaServed: ['North Dakota', 'United States'],
      makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: site.domain + url(s) } }))
    }
  }));
}

/* =========================== SERVICES HUB =========================== */
{
  const sp = site.servicesPage;
  let n = 0;
  const groupBlock = g => {
    const list = byGroup(g.id);
    const auds = ['business', 'artist', 'personal'].filter(a => list.some(s => s.audience === a));
    return `      <div id="${g.id}" style="scroll-margin-top:calc(var(--nav-h) + 24px)">
        <div class="idx-grp" data-rv>
          <span class="idx-grp-name">${ic(g.icon)} ${esc(g.name)}</span>
          <span class="mono">${String(list.length).padStart(2, '0')} ${list.length === 1 ? 'service' : 'services'}</span>
        </div>
${auds.map(a => {
      const rows = list.filter(s => s.audience === a);
      return `        <p class="idx-aud">${esc(site.audiences[a])}</p>
${rows.map(s => {
        n++;
        return `        <a class="row" href="${url(s)}" data-rv>
          <span class="row-no">${String(n).padStart(2, '0')}</span>
          <span class="row-name">${esc(s.name)}</span>
          <span class="row-desc">${esc(s.short)}</span>
          <span class="row-go">${ic('arrow')}</span>
        </a>`;
      }).join('\n')}`;
    }).join('\n')}
      </div>`;
  };

  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Services', '23')}
        <h1 class="display" style="max-width:13ch" data-words>${words(sp.headline, sp.accentIndex)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1"><p class="lede">${esc(sp.sub)}</p></div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/contact/">Start a project ${ic('arrow')}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-sm">
    <div class="wrap idx">
${site.groups.map(groupBlock).join('\n')}
    </div>
  </section>

${ctaBand(['Not', 'sure', 'which', 'one', 'you', 'need?'], 5, 'Describe the outcome you are after and we will tell you which services actually get you there, including the ones you do not need.')}`;

  write('services/index.html', page({
    title: sp.title, desc: sp.description, canonical: '/services/', active: 'services', body,
    ld: {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: 'Services', url: site.domain + '/services/',
      hasPart: services.map(s => ({ '@type': 'Service', name: s.name, url: site.domain + url(s) }))
    }
  }));
}

/* ========================= SERVICE DETAIL x23 ======================= */
services.forEach(s => {
  const rel = (s.related || []).map(find).filter(Boolean);
  const claim = s.group === 'audio'
    ? ['Human made', 'Every note is composed for one client. <em>Stock libraries and AI tracks</em> put the same music behind your competitor, and we will not do that to you.']
    : s.group === 'dj'
      ? ['Live, not pressed play', 'Our DJs perform on <em>industry controllers</em>, mixing and reading the room in real time. That is a different job from running a playlist.']
      : ['Direct access', 'No account managers between you and the crew. <em>The person on the call</em> is the person on set.'];

  const body = `
  <section class="svc-hero">
    <div class="wrap">
      <nav class="crumb" aria-label="Breadcrumb" data-rv>
        <a href="/">RecRoc</a><span class="sep">/</span>
        <a href="/services/">Services</a><span class="sep">/</span>
        <a href="/services/#${s.group}">${esc(groupName(s.group))}</a>
      </nav>

      <div class="svc-hero-grid" style="margin-top:clamp(24px,3vw,40px)">
        <div class="svc-head">
          <h1 class="h1" data-words>${words(s.name.split(' '), -1)}</h1>
        </div>
        <div class="svc-hero-aside">
          <p class="lede" data-rv>${esc(s.promise)}</p>
          <div class="hero-actions" data-rv style="--i:1">
            <a class="btn btn-red" href="/contact/?s=${encodeURIComponent(groupName(s.group))}">Start a project ${ic('arrow')}</a>
          </div>
        </div>
      </div>

      <div style="margin-top:clamp(32px,4.4vw,60px)">
        ${monitor(ph('r-cine', s.name + ' / hero image', groupIcon(s.group)), s.name.toUpperCase().slice(0, 22), true)}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="split">
        <div class="split-label" data-rv>${eyebrow('Overview')}</div>
        <div class="split-body" data-rv style="--i:1">
${s.overview.map((p, i) => `          <p class="${i === 0 ? 'lede' : 'body-soft'}">${esc(p)}</p>`).join('\n')}
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="split" style="margin-bottom:clamp(24px,3vw,38px)">
        <div data-rv>${eyebrow('What it covers', String(s.includes.length).padStart(2, '0'))}</div>
        <div data-rv style="--i:1"><h2 class="h2">${esc(s.short)}</h2></div>
      </div>
      <div class="inc">
${s.includes.map(([t, d], i) => `        <div class="inc-i" data-rv style="--i:${i}"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="sec-sm">
    <div class="wrap">
      <div class="claim" data-rv>
        <p class="eyebrow">${esc(claim[0])}</p>
        <p class="claim-t">${claim[1]}</p>
      </div>
    </div>
  </section>

  ${s.faqs && s.faqs.length ? `<section class="sec">
    <div class="wrap">
      ${shead('Questions', String(s.faqs.length).padStart(2, '0'), ['Good', 'questions.'], 1, 'Anything else, just ask. You get the person who would run the project, not a sales desk.')}
      ${faqBlock(s.faqs, 'fq')}
    </div>
  </section>` : ''}

  ${rel.length ? `<section class="sec ${s.faqs && s.faqs.length ? 'sec-top-0' : ''}">
    <div class="wrap">
      <div class="split" style="margin-bottom:clamp(22px,2.6vw,34px)">
        <div data-rv>${eyebrow('Often booked with')}</div>
        <div data-rv style="--i:1"><h2 class="h2">Most clients pair this with one of these.</h2></div>
      </div>
      <div class="rel">
${rel.map((r, i) => `        <a class="rel-i" href="${url(r)}" data-rv style="--i:${i}">
          <span class="rel-k">${esc(groupName(r.group))}</span>
          <span class="rel-n">${esc(r.name)} ${ic('upright')}</span>
          <span class="rel-d">${esc(r.short)}</span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>` : ''}

${ctaBand(['Ready', 'to', 'start?'], 2, `Tell us about the project and roughly when you need it. ${s.name} enquiries go straight to the team who would run it.`)}`;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service', name: s.name, description: s.meta,
        serviceType: groupName(s.group), url: site.domain + url(s),
        provider: { '@type': 'LocalBusiness', name: 'RecRoc', url: site.domain, telephone: site.phone, email: site.email },
        areaServed: ['North Dakota', 'United States']
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'RecRoc', item: site.domain + '/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: site.domain + '/services/' },
          { '@type': 'ListItem', position: 3, name: s.name, item: site.domain + url(s) }
        ]
      }
    ].concat(s.faqs && s.faqs.length ? [{
      '@type': 'FAQPage',
      mainEntity: s.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    }] : [])
  };

  write(`services/${s.slug}/index.html`, page({
    title: `${s.name} | RecRoc`, desc: s.meta, canonical: url(s), active: 'services', body, ld
  }));
});

/* =============================== ABOUT ============================== */
{
  const a = site.about;
  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('About', 'RecRoc')}
        <h1 class="display" style="max-width:12ch" data-words>${words(a.headline, a.accentIndex)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1"><p class="lede">${esc(a.sub)}</p></div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/contact/">Start a project ${ic('arrow')}</a>
            <a class="btn btn-line" href="/process/">How we work</a>
          </div>
        </div>
      </div>
      <div class="hero-monitor">
        ${monitor(ph('r-cine', 'Team at work / studio floor', 'camera'), 'STUDIO', true)}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="split">
        <div class="split-label" data-rv>${eyebrow('Who we are')}</div>
        <div class="split-body" data-rv style="--i:1">
${a.body.map((p, i) => `          <p class="${i === 0 ? 'lede' : 'body-soft'}">${esc(p)}</p>`).join('\n')}
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="claim" data-rv>
        <p class="eyebrow">Mission</p>
        <p class="claim-t">${esc(a.mission)}</p>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${shead('Why RecRoc', '03', ['Direct', 'access', 'to', 'the', 'makers.'], 4, 'A hybrid production company and creative agency, which in practice means fewer people between the brief and the camera.')}
      <div class="pillars">
${a.why.map((w, i) => `        <div class="pillar" data-rv style="--i:${i}">
          <p class="pillar-k">${String(i + 1).padStart(2, '0')}</p>
          <h3 class="h3">${esc(w.t)}</h3>
          <p class="body-soft">${esc(w.d)}</p>
        </div>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="sec sec-top-0">
    <div class="wrap">
      <div class="split" style="margin-bottom:clamp(22px,2.6vw,34px)">
        <div data-rv>${eyebrow('Values', '04')}</div>
        <div data-rv style="--i:1"><h2 class="h2">What we hold to, including when it costs us.</h2></div>
      </div>
      <div class="inc">
${a.values.map((v, i) => `        <div class="inc-i" data-rv style="--i:${i}"><b>${v.n} &nbsp; ${esc(v.t)}</b><span>${esc(v.d)}</span></div>`).join('\n')}
      </div>
    </div>
  </section>

${ctaBand(['Work', 'with', 'the', 'people', 'who', 'make', 'it.'], 6, 'Tell us what you are building. You will hear back from the person who would actually run it.')}`;

  write('about/index.html', page({ title: a.title, desc: a.description, canonical: '/about/', active: 'about', body,
    ld: { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About RecRoc', url: site.domain + '/about/', description: a.description } }));
}

/* ============================== PROCESS ============================= */
{
  const p = site.process;
  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Process', '05')}
        <h1 class="display" style="max-width:12ch" data-words>${words(p.headline, p.accentIndex)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1"><p class="lede">${esc(p.sub)}</p></div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/contact/">Start a project ${ic('arrow')}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="wrap" style="margin-top:clamp(30px,4vw,56px)">${rule()}</div>

  <section class="sec-sm">
    <div class="wrap">
      <div class="proc" data-proc>
        <div class="proc-stage">
          <div class="proc-numwrap">
${p.steps.map((s, i) => `            <span class="proc-num${i === 0 ? ' is-on' : ''}" data-proc-num>${s.n}</span>`).join('\n')}
          </div>
          <div>
            <p class="proc-tc" data-proc-tc>${p.steps[0].tc}</p>
            <div class="proc-rail" style="margin-top:14px"><span class="proc-fill" data-proc-fill style="width:20%"></span></div>
            <div class="proc-ticks" style="margin-top:10px">
${p.steps.map((s, i) => `              <span class="proc-tick${i === 0 ? ' is-on' : ''}" data-proc-tick>${s.n}</span>`).join('\n')}
            </div>
          </div>
        </div>

        <div class="proc-steps">
${p.steps.map((s, i) => `          <article class="proc-step${i === 0 ? ' is-on' : ''}" data-proc-step data-tc="${s.tc}">
            <p class="proc-step-k">Step ${s.n}</p>
            <h2 class="h1">${esc(s.t)}</h2>
            <p class="lede">${esc(s.d)}</p>
          </article>`).join('\n')}
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="claim" data-rv>
        <p class="eyebrow">In practice</p>
        <p class="claim-t">You will always know which step you are on, what is coming next, and who to call. <em>No silent weeks.</em></p>
      </div>
    </div>
  </section>

${ctaBand(['Start', 'at', 'step', 'one.'], 3, 'The first conversation is free, short, and honest about whether we are the right studio for the job.')}`;

  write('process/index.html', page({ title: p.title, desc: p.description, canonical: '/process/', active: 'process', body,
    ld: {
      '@context': 'https://schema.org', '@type': 'HowTo', name: 'The RecRoc process', description: p.description,
      step: p.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.d }))
    } }));
}

/* ============================== CONTACT ============================= */
{
  const c = site.contact;
  const body = `
  <section class="hero" style="padding-bottom:clamp(30px,4vw,54px)">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Contact', site.email)}
        <h1 class="display" style="max-width:13ch" data-words>${words(c.headline, c.accentIndex)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1"><p class="lede">${esc(c.sub)}</p></div>
          <dl class="hero-meta is-stack" style="margin:0;padding:0;border-top:0;--i:2" data-rv>
            <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
            <div><dt>Phone</dt><dd><a href="tel:${site.phoneHref}">${site.phone}</a></dd></div>
            <div><dt>Based</dt><dd>${esc(site.region)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </section>

${ctaBand(['Tell', 'us', 'what', 'you', 'are', 'making.'], 5, 'One form, one team, one reply. Usually within a working day.')}

  <section class="sec">
    <div class="wrap">
      ${shead('Before you write', '06', ['Common', 'questions.'], 1, 'Worth reading if you are weighing up timing, travel or how we handle music.')}
      ${faqBlock(site.globalFaqs.map(f => [f.q, f.a]), 'cq')}
    </div>
  </section>`;

  write('contact/index.html', page({ title: c.title, desc: c.description, canonical: '/contact/', active: 'contact', body,
    ld: { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Start a project', url: site.domain + '/contact/' } }));
}

/* =============================== THANKS ============================= */
{
  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Received', 'Thank you')}
        <h1 class="display" style="max-width:12ch" data-words>${words(['Got', 'it.', 'Talk', 'soon.'], 1)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1">
            <p class="lede">Your message is with the team. You will normally hear back within a working day, from the person who would actually run the project rather than a sales desk.</p>
          </div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/services/">Browse services ${ic('arrow')}</a>
            <a class="btn btn-line" href="/process/">What happens next</a>
          </div>
        </div>
        <dl class="hero-meta is-stack" data-rv style="--i:3">
          <div><dt>Something urgent</dt><dd><a href="tel:${site.phoneHref}">${site.phone}</a></dd></div>
          <div><dt>Prefer email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${shead('Next', '05', ['What', 'happens', 'now.'], 2, 'Step one is a short, honest conversation about whether we are the right studio for this job.')}
      <div class="pstrip">
${site.process.steps.map((s, i) => `        <div class="pstrip-i" data-rv style="--i:${i}">
          <p class="pstrip-n">${s.n}</p>
          <h3 class="h3">${esc(s.t)}</h3>
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;
  write('thanks/index.html', page({
    title: 'Thank you | RecRoc', desc: 'Your message has been received. We will be in touch shortly.',
    canonical: '/thanks/', active: '', body
  }));
}

/* ================================ 404 =============================== */
{
  const body = `
  <section class="hero">
    <div class="wrap">
      <div class="hero-head">
        ${eyebrow('Error', '404')}
        <h1 class="display" style="max-width:12ch" data-words>${words(['No', 'signal', 'on', 'this', 'channel.'], 1)}</h1>
        <div class="hero-lower">
          <div data-rv style="--i:1"><p class="lede">That page is not here. It may have moved, or the link may be wrong. The services index is the fastest way back.</p></div>
          <div class="hero-actions" data-rv style="--i:2">
            <a class="btn btn-red" href="/services/">All 23 services ${ic('arrow')}</a>
            <a class="btn btn-line" href="/">Home</a>
          </div>
        </div>
      </div>
      <div class="hero-monitor">${monitor(ph('r-cine', 'No input', 'video'), 'NO SIGNAL', true)}</div>
    </div>
  </section>`;
  write('404.html', page({ title: 'Page not found | RecRoc', desc: 'That page could not be found.', canonical: '/404.html', active: '', body }));
}

/* ========================= sitemap + robots ========================= */
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

console.log(`built ${services.length} service pages + 6 core pages + sitemap`);
