import React from 'react';
import TemplateCard from './TemplateCard.jsx';
import { TEMPLATE_DEFS } from './registry.js';

export default function TemplatePicker({ value, isPro, onChange, onLockedPick }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {TEMPLATE_DEFS.map((t) => {
        const locked = !isPro && !t.free;
        return (
          <TemplateCard
            key={t.id}
            templateId={t.id}
            name={t.name}
            selected={value === t.id}
            locked={locked}
            onClick={() => {
              if (locked) {
                onLockedPick?.(t);
                return;
              }
              onChange(t.id);
            }}
          />
        );
      })}
    </div>
  );
}
