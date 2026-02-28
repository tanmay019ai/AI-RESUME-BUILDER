import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function TwoColumnStructured({ profile, content }) {
  return (
    <ResumeBase
      profile={profile}
      content={content}
      variant={{ header: 'lined', layout: 'two-col', labels: { summary: 'PROFILE', skills: 'SKILLS', education: 'EDUCATION' } }}
    />
  );
}
