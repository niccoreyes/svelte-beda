import { writable, type Writable } from 'svelte/store';

export interface SharedState<T> {
	get: () => T;
	set: (value: T) => void;
	subscribe: Writable<T>['subscribe'];
}

export function createSharedState<T>(initialValue: T): SharedState<T> {
	const store = writable<T>(initialValue);

	return {
		get: () => {
			let value: T = initialValue;
			store.subscribe((v) => {
				value = v;
			})();
			return value;
		},
		set: (value: T) => store.set(value),
		subscribe: store.subscribe
	};
}

export const fhirBaseURLState = createSharedState<string>('');
export const currentLocaleState = createSharedState<string>('en');
