import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderTwoColumnStructured({ profile, content, watermark, brandName }) {
  const left = `
    <div class="side">
      ${avatarHtml(profile.photoDataUrl)}
      <div class="name">${safe(profile.fullName)}</div>
      <div class="muted small">${safe(content.headline || profile.targetRole || '')}</div>
      <div class="small" style="margin-top:10px">
        <div>${safe(profile.email)}</div>
        <div>${safe(profile.phone)}</div>
      </div>
      <div style="margin-top:12px">
        ${section('Skills', `<div class="small">${safe((content.skills || []).join(' • '))}</div>`)}
      </div>
      <div style="margin-top:12px">
        ${section('Education', (content.education || []).length ? (content.education || []).map((ed)=>`<div class=\"item avoidBreak\"><div class=\"small\"><strong>${safe(ed.degree)}</strong></div><div class=\"small muted\">${safe(ed.school)}</div><div class=\"small muted\">${safe(ed.startDate)} - ${safe(ed.endDate)}</div><ul>${li(ed.details||[])}</ul></div>`).join('') : '<p class="muted">—</p>')}
      </div>
    </div>
  `;

  const exp = (content.experience || []).map((e) => `
    <div class="item avoidBreak">
      <div class="row">
        <div><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
        <div class="right muted">${safe(e.startDate)} - ${safe(e.endDate)}</div>
      </div>
      <div class="muted small">${safe(e.location)}</div>
      <ul>${li(e.bullets || [])}</ul>
    </div>
  `).join('');

  const pro = (content.projects || []).map((p) => `
    <div class="item avoidBreak">
      <div><strong>${safe(p.name)}</strong>${p.tech?.length ? ` <span class="muted small">(${safe(p.tech.join(', '))})</span>` : ''}</div>
      <ul>${li(p.bullets || [])}</ul>
    </div>
  `).join('');

  const right = `
    <div class="main">
      ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
      ${section('Experience', exp || '<p class="muted">—</p>')}
      ${section('Projects', pro || '<p class="muted">—</p>')}
    </div>
  `;

  const body = `
    ${watermarkHtml({ watermark, brandName })}
    <div class="page">
      <div class="cols">
        ${left}
        ${right}
      </div>
    </div>
  `;

  const css = `
    .cols { display:grid; grid-template-columns: 1fr 2.2fr; gap: 16px; }
    .side { border-right: 1px solid #e5e7eb; padding-right: 12px; }
    .main { padding-left: 4px; }
    .name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .small { font-size: 11px; line-height: 1.45; }
    .secTitle { font-size: 12px; }
    @media (max-width: 720px) {
      .cols { grid-template-columns: 1fr; }
      .side { border-right: none; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px; }
    }
  `;

  return wrapDocument({ css, body });
}
