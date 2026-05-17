import { addMessages, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import { browser } from '$app/environment';
import { config } from '$lib/config';

import en from './locale/en.json';
import es from './locale/es.json';
import ru from './locale/ru.json';
import de from './locale/de.json';

addMessages('en', en);
addMessages('es', es);
addMessages('ru', ru);
addMessages('de', de);

let initialized = false;

export function setupI18n() {
	if (!browser) return;
	if (initialized) return;
	initialized = true;

	const storedLocale = localStorage.getItem('locale');
	const initialLocale = storedLocale || config.defaultLocale || getLocaleFromNavigator() || 'en';

	init({
		fallbackLocale: 'en',
		initialLocale,
		formats: {
			number: {
				compact: { notation: 'compact' },
				percent: { style: 'percent' }
			},
			date: {
				short: { month: 'short', day: 'numeric', year: 'numeric' }
			},
			time: {
				short: { hour: 'numeric', minute: 'numeric' }
			}
		}
		// Pluralization is supported natively via ICU MessageFormat in locale strings.
		// Example: "{count, plural, one {# patient} other {# patients}}"
	});

	locale.subscribe((l) => {
		if (l) localStorage.setItem('locale', l);
	});
}

export function setLocale(newLocale: string) {
	if (!browser) return;
	locale.set(newLocale);
}

export function getCurrentLocale(): string {
	let current = 'en';
	locale.subscribe((l) => {
		if (l) current = l;
	})();
	return current;
}
