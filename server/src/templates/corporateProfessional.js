import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderCorporateProfessional({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      ${avatarHtml(profile.photoDataUrl)}
      <div class="nameBlock">
        <div class="name">${safe(profile.fullName)}</div>
        <div class="role">${safe(content.headline || profile.targetRole || '')}</div>
      </div>
      <div class="contact">
        <div>${safe(profile.email)}</div>
        <div>${safe(profile.phone)}</div>
      </div>
    </div>
  `;

  const exp = (content.experience || [])
    .map(
      (e) => `
      <div class="item avoidBreak">
        <div class="row top">
          <div><strong>${safe(e.company)}</strong> — ${safe(e.title)}</div>
          <div class="right">${safe(e.startDate)} - ${safe(e.endDate)}</div>
        </div>
        <div class="muted">${safe(e.location)}</div>
        <ul>${li(e.bullets || [])}</ul>
      </div>
    `
    )
    .join('');

  const edu = (content.education || [])
    .map(
      (ed) => `
      <div class="item avoidBreak">
        <div class="row">
          <div><strong>${safe(ed.degree)}</strong> — ${safe(ed.school)}</div>
          <div class="right muted">${safe(ed.startDate)} - ${safe(ed.endDate)}</div>
        </div>
        <ul>${li(ed.details || [])}</ul>
      </div>
    `
    )
    .join('');

  const body = `
    ${watermarkHtml({ watermark, brandName })}
    <div class="page">
      ${header}
      <div class="grid">
        <div>
          ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
          ${section('Experience', exp || '<p class="muted">—</p>')}
          ${section('Projects', (content.projects || []).length ? (content.projects || []).map((p)=>`<div class=\"item avoidBreak\"><div><strong>${safe(p.name)}</strong>${p.tech?.length?` <span class=\"muted\">(${safe(p.tech.join(', '))})</span>`:''}</div><ul>${li(p.bullets||[])}</ul></div>`).join('') : '<p class="muted">—</p>')}
        </div>
        <div>
          ${section('Skills', `<div class="skillBox">${safe((content.skills || []).join(' • '))}</div>`)}
          ${section('Education', edu || '<p class="muted">—</p>')}
        </div>
      </div>
    </div>
  `;

  const css = `
    .hdr { display:flex; justify-content:space-between; gap:16px; padding:14px 16px; border:1px solid #e5e7eb; border-radius: 10px; }
    .name { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .role { margin-top: 4px; font-size: 12px; color: #374151; }
    .contact { text-align:right; font-size: 12px; color:#111827; }
    .grid { margin-top: 12px; display:grid; grid-template-columns: 2fr 1fr; gap: 14px; }
    .skillBox { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
    .row.top { font-weight: 600; }
    @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
  `;

  return wrapDocument({ css, body });
}
