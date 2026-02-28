import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function CorporateProfessional({ profile, content }) {
  return (
    <ResumeBase
      profile={profile}
      content={content}
      variant={{ header: 'lined', layout: 'two-col', labels: { projects: 'KEY PROJECTS' } }}
    />
  );
}
