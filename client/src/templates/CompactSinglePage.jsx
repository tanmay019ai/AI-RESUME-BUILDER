import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function CompactSinglePage({ profile, content }) {
  return (
    <div className="[&_*]:tracking-tight">
      <ResumeBase
        profile={profile}
        content={content}
        variant={{ header: 'plain', layout: 'two-col', labels: { experience: 'WORK', projects: 'PROJECTS' } }}
      />
    </div>
  );
}
