import React from 'react';
import ResumeBase from './ResumeBase.jsx';

export default function CreativeDesigner({ profile, content }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/30 p-2 dark:border-slate-800 dark:bg-slate-950/20">
      <div className="rounded-2xl border-l-4 border-slate-900/90 p-4 dark:border-slate-200/70">
        <ResumeBase
          profile={profile}
          content={content}
          variant={{ header: 'lined', labels: { projects: 'FEATURED WORK', summary: 'ABOUT' } }}
        />
      </div>
    </div>
  );
}
