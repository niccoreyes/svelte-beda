import { browser } from '$app/environment';

export function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function watchSystemTheme(
	callback: (theme: 'light' | 'dark') => void
): (() => void) | undefined {
	if (!browser) return;
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = (e: MediaQueryListEvent) => callback(e.matches ? 'dark' : 'light');
	mq.addEventListener('change', handler);
	return () => mq.removeEventListener('change', handler);
}
