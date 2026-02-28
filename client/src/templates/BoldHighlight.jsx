import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function BoldHighlight({ profile, content }) {
  return <ResumeBase profile={profile} content={content} variant={{ header: 'bold', labels: { skills: 'HIGHLIGHTED SKILLS' } }} />;
}
