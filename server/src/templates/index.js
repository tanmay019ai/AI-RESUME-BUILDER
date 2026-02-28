import { getTemplateDef } from './registry.js';

import { renderModernClean } from './modernClean.js';
import { renderCorporateProfessional } from './corporateProfessional.js';
import { renderMinimalAts } from './minimalAts.js';
import { renderCreativeDesigner } from './creativeDesigner.js';
import { renderTechDeveloper } from './techDeveloper.js';
import { renderElegantExecutive } from './elegantExecutive.js';
import { renderCompactSinglePage } from './compactSinglePage.js';
import { renderTwoColumnStructured } from './twoColumnStructured.js';
import { renderBoldHighlight } from './boldHighlight.js';
import { renderAcademicStyle } from './academicStyle.js';

const renderers = {
  'modern-clean': renderModernClean,
  'corporate-professional': renderCorporateProfessional,
  'minimal-ats': renderMinimalAts,
  'creative-designer': renderCreativeDesigner,
  'tech-developer': renderTechDeveloper,
  'elegant-executive': renderElegantExecutive,
  'compact-single-page': renderCompactSinglePage,
  'two-column-structured': renderTwoColumnStructured,
  'bold-highlight': renderBoldHighlight,
  'academic-style': renderAcademicStyle,
};

export function renderResumeHtml({ templateId, profile, content, isPro, watermark, brandName }) {
  const def = getTemplateDef(templateId);
  const render = (def && renderers[def.id]) || renderers['modern-clean'];
  return render({ profile, content, isPro, watermark, brandName });
}
