import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderElegantExecutive({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      ${avatarHtml(profile.photoDataUrl)}
      <div>
        <div class="name">${safe(profile.fullName)}</div>
        <div class="role">${safe(content.headline || profile.targetRole || '')}</div>
      </div>
      <div class="contact">
        <div>${safe(profile.email)}</div>
        <div>${safe(profile.phone)}</div>
      </div>
    </div>
  `;

  const exp = (content.experience || []).map((e) => `
    <div class="item avoidBreak">
      <div class="row">
        <div><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
        <div class="right muted">${safe(e.startDate)} - ${safe(e.endDate)}</div>
      </div>
      <div class="muted">${safe(e.location)}</div>
      <ul>${li(e.bullets || [])}</ul>
    </div>
  `).join('');

  const pro = (content.projects || []).map((p) => `
    <div class="item avoidBreak">
      <div><strong>${safe(p.name)}</strong>${p.tech?.length ? ` <span class="muted">(${safe(p.tech.join(', '))})</span>` : ''}</div>
      <ul>${li(p.bullets || [])}</ul>
    </div>
  `).join('');

  const edu = (content.education || []).map((ed) => `
    <div class="item avoidBreak">
      <div class="row">
        <div><strong>${safe(ed.school)}</strong> — ${safe(ed.degree)}</div>
        <div class="right muted">${safe(ed.startDate)} - ${safe(ed.endDate)}</div>
      </div>
      <ul>${li(ed.details || [])}</ul>
    </div>
  `).join('');

  const body = `
    ${watermarkHtml({ watermark, brandName })}
    <div class="page">
      ${header}
      ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
      ${section('Skills', `<p>${safe((content.skills || []).join(' • '))}</p>`)}
      ${section('Experience', exp || '<p class="muted">—</p>')}
      ${section('Projects', pro || '<p class="muted">—</p>')}
      ${section('Education', edu || '<p class="muted">—</p>')}
    </div>
  `;

  const css = `
    .hdr { display:flex; justify-content:space-between; gap:16px; padding-bottom:12px; border-bottom: 2px solid #111; }
    .name { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
    .role { margin-top: 4px; font-size: 12px; color: #374151; }
    .contact { text-align:right; font-size: 12px; color:#111; }
    .secTitle { border-top: 1px solid #e5e7eb; padding-top: 10px; }
  `;

  return wrapDocument({ css, body });
}
