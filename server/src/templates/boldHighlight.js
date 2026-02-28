import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderBoldHighlight({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      ${avatarHtml(profile.photoDataUrl)}
      <div class="name">${safe(profile.fullName)}</div>
      <div class="meta">${safe(content.headline || profile.targetRole || '')}</div>
      <div class="meta2">${safe(profile.email)} • ${safe(profile.phone)}</div>
    </div>
  `;

  const exp = (content.experience || []).map((e) => `
    <div class="item avoidBreak">
      <div class="row">
        <div><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
        <div class="right">${safe(e.startDate)} - ${safe(e.endDate)}</div>
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
      ${section('Skills', `<div class="band">${safe((content.skills || []).join(' • '))}</div>`)}
      ${section('Experience', exp || '<p class="muted">—</p>')}
      ${section('Projects', pro || '<p class="muted">—</p>')}
      ${section('Education', edu || '<p class="muted">—</p>')}
    </div>
  `;

  const css = `
    .hdr { padding: 12px 14px; border-radius: 12px; background: #111; color: #fff; display:grid; grid-template-columns: auto 1fr; gap: 2px 12px; align-items:center; }
    .hdr .name, .hdr .meta, .hdr .meta2 { grid-column: 2; }
    .name { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .meta { margin-top: 4px; font-size: 12px; color: rgba(255,255,255,0.9); }
    .meta2 { margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.85); }
    .band { border: 1px solid #111; border-radius: 10px; padding: 10px; }
  `;

  return wrapDocument({ css, body });
}
