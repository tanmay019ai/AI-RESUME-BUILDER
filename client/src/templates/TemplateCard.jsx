import React from 'react';
import { motion } from 'framer-motion';
import TemplateRenderer from './TemplateRenderer.jsx';
import { SAMPLE_CONTENT, SAMPLE_PROFILE } from './sampleData.js';

function MiniThumb({ templateId }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-white">
      <div className="h-[210px] overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-200 dark:bg-white">
        <div className="pointer-events-none select-none origin-top-left scale-[0.18]">
          <div className="w-[210mm] bg-white text-slate-900">
            <div className="min-h-[297mm] bg-white text-slate-900">
              <TemplateRenderer templateId={templateId} profile={SAMPLE_PROFILE} content={SAMPLE_CONTENT} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateCard({ templateId, name, selected, locked, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={
        'w-full rounded-2xl border p-4 text-left transition-colors ' +
        (selected
          ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20'
          : 'border-slate-200 bg-white/40 hover:bg-white/60 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-950/30')
      }
      aria-disabled={locked}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {locked ? 'Pro only' : selected ? 'Selected' : 'Click to select'}
          </div>
        </div>
        {locked ? (
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Locked
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <MiniThumb templateId={templateId} />
      </div>
    </motion.button>
  );
}
