import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark';

export function getInitialTheme(): ThemeMode {
	if (!browser) return 'light';
	const stored = localStorage.getItem('theme');
	if (stored === 'dark' || stored === 'light') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(mode: ThemeMode): void {
	if (!browser) return;
	localStorage.setItem('theme', mode);
	if (mode === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

export function toggleTheme(): ThemeMode {
	const current = getInitialTheme();
	const next = current === 'light' ? 'dark' : 'light';
	setTheme(next);
	return next;
}
