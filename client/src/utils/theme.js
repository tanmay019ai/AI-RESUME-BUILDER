const THEME_KEY = 'arb_theme';

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  document.documentElement.classList.toggle('dark', Boolean(isDark));
}

export function toggleTheme() {
  const currentlyDark = document.documentElement.classList.contains('dark');
  const nextDark = !currentlyDark;
  document.documentElement.classList.toggle('dark', nextDark);
  localStorage.setItem(THEME_KEY, nextDark ? 'dark' : 'light');
  return nextDark;
}
