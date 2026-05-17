import type { RemoteData } from './remoteData';
import { notAsked, loading, success, failure } from './remoteData';

export interface ServiceState<T> {
	data: RemoteData<T, Error>;
	reload: () => Promise<void>;
	softReload: () => Promise<void>;
	set: (data: T) => void;
}

export function createServiceState<T>(fetcher: () => Promise<T>): ServiceState<T> {
	let data = $state<RemoteData<T, Error>>(notAsked());

	async function load(soft = false) {
		if (!soft) {
			data = loading();
		}
		try {
			const result = await fetcher();
			data = success(result);
		} catch (err) {
			data = failure(err instanceof Error ? err : new Error(String(err)));
		}
	}

	return {
		get data() {
			return data;
		},
		reload: () => load(false),
		softReload: () => load(true),
		set: (newData: T) => {
			data = success(newData);
		}
	};
}
