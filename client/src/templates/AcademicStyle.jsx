import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function AcademicStyle({ profile, content }) {
  return (
    <ResumeBase
      profile={profile}
      content={content}
      variant={{ header: 'lined', labels: { summary: 'RESEARCH SUMMARY', experience: 'ACADEMIC / INDUSTRY EXPERIENCE', projects: 'SELECTED PROJECTS' } }}
    />
  );
}
