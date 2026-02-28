import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function MinimalAts({ profile, content }) {
  return <ResumeBase profile={profile} content={content} variant={{ header: 'plain' }} />;
}
