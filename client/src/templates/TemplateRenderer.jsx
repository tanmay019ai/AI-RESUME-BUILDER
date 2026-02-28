import React from 'react';

import ModernClean from './ModernClean.jsx';
import CorporateProfessional from './CorporateProfessional.jsx';
import MinimalAts from './MinimalAts.jsx';
import CreativeDesigner from './CreativeDesigner.jsx';
import TechDeveloper from './TechDeveloper.jsx';
import ElegantExecutive from './ElegantExecutive.jsx';
import CompactSinglePage from './CompactSinglePage.jsx';
import TwoColumnStructured from './TwoColumnStructured.jsx';
import BoldHighlight from './BoldHighlight.jsx';
import AcademicStyle from './AcademicStyle.jsx';

export default function TemplateRenderer({ templateId, profile, content }) {
  switch (templateId) {
    case 'modern-clean':
      return <ModernClean profile={profile} content={content} />;
    case 'corporate-professional':
      return <CorporateProfessional profile={profile} content={content} />;
    case 'minimal-ats':
      return <MinimalAts profile={profile} content={content} />;
    case 'creative-designer':
      return <CreativeDesigner profile={profile} content={content} />;
    case 'tech-developer':
      return <TechDeveloper profile={profile} content={content} />;
    case 'elegant-executive':
      return <ElegantExecutive profile={profile} content={content} />;
    case 'compact-single-page':
      return <CompactSinglePage profile={profile} content={content} />;
    case 'two-column-structured':
      return <TwoColumnStructured profile={profile} content={content} />;
    case 'bold-highlight':
      return <BoldHighlight profile={profile} content={content} />;
    case 'academic-style':
      return <AcademicStyle profile={profile} content={content} />;
    default:
      return <ModernClean profile={profile} content={content} />;
  }
}
