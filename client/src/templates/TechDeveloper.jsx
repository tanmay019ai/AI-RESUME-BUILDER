import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function TechDeveloper({ profile, content }) {
  return (
    <div className="font-mono">
      <ResumeBase
        profile={profile}
        content={content}
        variant={{ header: 'lined', labels: { skills: 'TECH STACK', projects: 'PROJECTS' } }}
      />
    </div>
  );
}
