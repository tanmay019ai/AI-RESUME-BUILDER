// Minimal, ATS-friendly single-column HTML template.
// Pro users can get a slightly enhanced header, but still ATS-safe.
export function renderResumeHtml({ profile, content, isPro, watermark }) {
  const safe = (v) => String(v || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  const li = (items = []) => items.map((x) => `<li>${safe(x)}</li>`).join('');
  const section = (title, body) => `
    <section>
      <h2>${safe(title)}</h2>
      ${body}
    </section>
  `;

  const experienceHtml = (content.experience || [])
    .map((e) => {
      return `
        <div class="item">
          <div class="row">
            <div class="left"><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
            <div class="right">${safe(e.startDate)} - ${safe(e.endDate)}</div>
          </div>
          <div class="muted">${safe(e.location)}</div>
          <ul>${li(e.bullets || [])}</ul>
        </div>
      `;
    })
    .join('');

  const projectsHtml = (content.projects || [])
    .map((p) => {
      const tech = (p.tech || []).join(', ');
      return `
        <div class="item">
          <div class="row">
            <div class="left"><strong>${safe(p.name)}</strong>${tech ? ` <span class="muted">(${safe(tech)})</span>` : ''}</div>
          </div>
          <ul>${li(p.bullets || [])}</ul>
        </div>
      `;
    })
    .join('');

  const educationHtml = (content.education || [])
    .map((ed) => {
      return `
        <div class="item">
          <div class="row">
            <div class="left"><strong>${safe(ed.school)}</strong> — ${safe(ed.degree)}</div>
            <div class="right">${safe(ed.startDate)} - ${safe(ed.endDate)}</div>
          </div>
          <ul>${li(ed.details || [])}</ul>
        </div>
      `;
    })
    .join('');

  const header = isPro
    ? `
      <div class="header pro">
        <div>
          <h1>${safe(profile.fullName)}</h1>
          <div class="headline">${safe(content.headline)}</div>
        </div>
        <div class="contact">
          <div>${safe(profile.email)}</div>
          <div>${safe(profile.phone)}</div>
        </div>
      </div>
    `
    : `
      <div class="header">
        <h1>${safe(profile.fullName)}</h1>
        <div class="contact">${safe(profile.email)} | ${safe(profile.phone)}</div>
      </div>
    `;

  const watermarkHtml = watermark
    ? `<div class="watermark">AI Resume Builder — Free Plan</div>`
    : '';

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Resume</title>
      <style>
        :root { color-scheme: light; }
        body { font-family: Arial, Helvetica, sans-serif; margin: 32px; color: #111; }
        h1 { font-size: 26px; margin: 0; }
        .headline { margin-top: 4px; font-size: 14px; color: #333; }
        .header { margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
        .header.pro { display: flex; justify-content: space-between; align-items: flex-start; }
        .contact { font-size: 12px; color: #333; margin-top: 6px; }
        section { margin-top: 14px; }
        h2 { font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px 0; }
        p { margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; }
        ul { margin: 6px 0 0 16px; padding: 0; font-size: 12px; line-height: 1.45; }
        li { margin: 2px 0; }
        .row { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; }
        .left { flex: 1; }
        .right { white-space: nowrap; color: #333; }
        .muted { color: #555; font-size: 11px; margin-top: 2px; }
        .item { margin-top: 8px; }
        .watermark {
          position: fixed;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 40px;
          color: rgba(0,0,0,0.08);
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      ${watermarkHtml}
      ${header}
      ${section('Summary', `<p>${safe(content.summary)}</p>`)}
      ${section('Skills', `<p>${safe((content.skills || []).join(' • '))}</p>`)}
      ${section('Experience', experienceHtml || '<p class="muted">—</p>')}
      ${section('Projects', projectsHtml || '<p class="muted">—</p>')}
      ${section('Education', educationHtml || '<p class="muted">—</p>')}
    </body>
  </html>
  `;
}
