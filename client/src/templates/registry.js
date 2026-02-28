export const TEMPLATE_DEFS = [
  { id: 'modern-clean', name: 'Modern Clean', free: true },
  { id: 'corporate-professional', name: 'Corporate Professional', free: true },
  { id: 'minimal-ats', name: 'Minimal ATS', free: true },
  { id: 'creative-designer', name: 'Creative Designer', free: false },
  { id: 'tech-developer', name: 'Tech Developer', free: false },
  { id: 'elegant-executive', name: 'Elegant Executive', free: false },
  { id: 'compact-single-page', name: 'Compact Single Page', free: false },
  { id: 'two-column-structured', name: 'Two Column Structured', free: false },
  { id: 'bold-highlight', name: 'Bold Highlight', free: false },
  { id: 'academic-style', name: 'Academic Style', free: false },
];

export function getTemplateDef(templateId) {
  return TEMPLATE_DEFS.find((t) => t.id === templateId) || null;
}
