export { getPalette } from './palette';
export { getInitialTheme, setTheme, toggleTheme, type ThemeMode } from './darkMode';
export { getSystemTheme, watchSystemTheme } from './systemTheme';

import { browser } from '$app/environment';
import { getSystemTheme } from './systemTheme';

export type ThemePreference = 'light' | 'dark' | 'auto';

export function getThemePreference(): ThemePreference {
	if (!browser) return 'auto';
	const stored = localStorage.getItem('beda_theme_mode');
	if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
	return 'auto';
}

export function setThemePreference(mode: ThemePreference): void {
	if (!browser) return;
	localStorage.setItem('beda_theme_mode', mode);
	applyResolvedTheme(mode);
}

export function applyResolvedTheme(mode: ThemePreference): void {
	if (!browser) return;
	const resolved = mode === 'auto' ? getSystemTheme() : mode;
	if (resolved === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}
