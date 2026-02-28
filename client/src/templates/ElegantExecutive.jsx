import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function ElegantExecutive({ profile, content }) {
  return <ResumeBase profile={profile} content={content} variant={{ header: 'lined', labels: { summary: 'EXECUTIVE SUMMARY' } }} />;
}
