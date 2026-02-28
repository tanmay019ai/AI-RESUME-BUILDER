import { li, safe, section, watermarkHtml, wrapDocument } from './helpers.js';

export function renderMinimalAts({ profile, content, watermark, brandName }) {
  const header = `
    <div class="hdr">
      <div class="name">${safe(profile.fullName)}</div>
      <div class="contact">${safe(profile.email)} | ${safe(profile.phone)}</div>
    </div>
  `;

  const exp = (content.experience || [])
    .map(
      (e) => `
      <div class="item avoidBreak">
        <div class="row">
          <div><strong>${safe(e.title)}</strong> — ${safe(e.company)}</div>
          <div class="right muted">${safe(e.startDate)} - ${safe(e.endDate)}</div>
        </div>
        <div class="muted">${safe(e.location)}</div>
        <ul>${li(e.bullets || [])}</ul>
      </div>
    `
    )
    .join('');

  const pro = (content.projects || [])
    .map(
      (p) => `
      <div class="item avoidBreak">
        <div><strong>${safe(p.name)}</strong>${p.tech?.length ? ` <span class="muted">(${safe(p.tech.join(', '))})</span>` : ''}</div>
        <ul>${li(p.bullets || [])}</ul>
      </div>
    `
    )
    .join('');

  const edu = (content.education || [])
    .map(
      (ed) => `
      <div class="item avoidBreak">
        <div class="row">
          <div><strong>${safe(ed.school)}</strong> — ${safe(ed.degree)}</div>
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
      ${section('Summary', `<p>${safe(content.summary || '')}</p>`)}
      ${section('Skills', `<p>${safe((content.skills || []).join(', '))}</p>`)}
      ${section('Experience', exp || '<p class="muted">—</p>')}
      ${section('Projects', pro || '<p class="muted">—</p>')}
      ${section('Education', edu || '<p class="muted">—</p>')}
    </div>
  `;

  const css = `
    .hdr { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
    .name { font-size: 24px; font-weight: 700; }
    .contact { font-size: 12px; color: #111; margin-top: 4px; }
    .secTitle { font-size: 12px; letter-spacing: 0.10em; }
  `;

  return wrapDocument({ css, body });
}
