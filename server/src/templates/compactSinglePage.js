import { avatarHtml, li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderCompactSinglePage({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      ${avatarHtml(profile.photoDataUrl)}
      <div class="name">${safe(profile.fullName)}</div>
      <div class="meta">${safe(profile.email)} • ${safe(profile.phone)} • ${safe(content.headline || profile.targetRole || '')}</div>
    </div>
  `;

  const exp = (content.experience || []).map((e) => `
    <div class="item avoidBreak">
      <div class="row">
        <div><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
        <div class="right muted">${safe(e.startDate)} - ${safe(e.endDate)}</div>
      </div>
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
      <div class="two">
        <div>
          ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
          ${section('Experience', exp || '<p class="muted">—</p>')}
        </div>
        <div>
          ${section('Skills', `<p>${safe((content.skills || []).join(' • '))}</p>`)}
          ${section('Projects', pro || '<p class="muted">—</p>')}
          ${section('Education', edu || '<p class="muted">—</p>')}
        </div>
      </div>
    </div>
  `;

  const css = `
    :root { --base-font: 11px; --section-gap: 10px; --title-font: 22px; }
    .hdr { margin-bottom: 8px; display:grid; grid-template-columns: auto 1fr; gap: 2px 12px; align-items:center; }
    .hdr .name { grid-column: 2; }
    .hdr .meta { grid-column: 2; }
    .name { font-size: var(--title-font); font-weight: 800; letter-spacing: -0.02em; }
    .meta { margin-top: 4px; font-size: 11px; color: #333; }
    .two { display:grid; grid-template-columns: 1.6fr 1fr; gap: 12px; }
    .secTitle { font-size: 12px; }
    ul { margin-left: 14px; }
    @media (max-width: 720px) { .two { grid-template-columns: 1fr; } }
  `;

  return wrapDocument({ css, body });
}
