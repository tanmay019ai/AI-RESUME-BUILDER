import React, { useState } from 'react';
import { toggleTheme } from '../utils/theme.js';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  return (
    <button
      type="button"
      onClick={() => setIsDark(toggleTheme())}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  );
}
