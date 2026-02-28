import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderCreativeDesigner({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      ${avatarHtml(profile.photoDataUrl)}
      <div class="name">${safe(profile.fullName)}</div>
      <div class="tag">${safe(content.headline || profile.targetRole || '')}</div>
      <div class="contact">${safe(profile.email)} • ${safe(profile.phone)}</div>
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
      <div class="split">
        <div>
          ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
          ${section('Experience', exp || '<p class="muted">—</p>')}
          ${section('Projects', pro || '<p class="muted">—</p>')}
        </div>
        <div>
          ${section('Skills', `<div class="pill">${safe((content.skills || []).join(' • '))}</div>`)}
          ${section('Education', edu || '<p class="muted">—</p>')}
        </div>
      </div>
    </div>
  `;

  const css = `
    .hdr { padding: 12px 14px; border-left: 5px solid #111; background: #f7f7f7; border-radius: 10px; display:grid; grid-template-columns: auto 1fr; gap: 10px 14px; align-items:start; }
    .hdr .name { grid-column: 2; }
    .hdr .tag { grid-column: 2; }
    .hdr .contact { grid-column: 2; }
    .name { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .tag { margin-top: 4px; font-size: 12px; color: #111; }
    .contact { margin-top: 6px; font-size: 12px; color: #333; }
    .split { margin-top: 10px; display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
    .pill { border: 1px dashed #bbb; border-radius: 10px; padding: 10px; }
    @media (max-width: 720px) { .split { grid-template-columns: 1fr; } }
  `;

  return wrapDocument({ css, body });
}
