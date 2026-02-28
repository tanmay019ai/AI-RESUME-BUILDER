export const TEMPLATE_DEFS = [
  { id: 'modern-clean', name: 'Modern Clean', free: true, singlePage: false },
  { id: 'corporate-professional', name: 'Corporate Professional', free: true, singlePage: false },
  { id: 'minimal-ats', name: 'Minimal ATS', free: true, singlePage: false },
  { id: 'creative-designer', name: 'Creative Designer', free: false, singlePage: false },
  { id: 'tech-developer', name: 'Tech Developer', free: false, singlePage: false },
  { id: 'elegant-executive', name: 'Elegant Executive', free: false, singlePage: false },
  { id: 'compact-single-page', name: 'Compact Single Page', free: false, singlePage: true },
  { id: 'two-column-structured', name: 'Two Column Structured', free: false, singlePage: false },
  { id: 'bold-highlight', name: 'Bold Highlight', free: false, singlePage: false },
  { id: 'academic-style', name: 'Academic Style', free: false, singlePage: false },
];

export const TEMPLATE_IDS = TEMPLATE_DEFS.map((t) => t.id);

export function getTemplateDef(templateId) {
  return TEMPLATE_DEFS.find((t) => t.id === templateId) || null;
}

export function assertTemplateAllowed({ templateId, isPro }) {
  const def = getTemplateDef(templateId);
  if (!def) {
    const err = new Error('Invalid template');
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }
  if (!isPro && !def.free) {
    const err = new Error('This template is available on Pro. Upgrade to unlock all templates.');
    err.statusCode = 403;
    err.expose = true;
    throw err;
  }
  return def;
}
