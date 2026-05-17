import { serializeSortParam } from './searchParams';

export interface TableSorterOptions {
	resourceType: string;
	initialSortKey?: string;
	initialSortDirection?: 'asc' | 'desc';
}

export interface TableSorterResult {
	readonly sortKey: string | null;
	readonly sortDirection: 'asc' | 'desc';
	readonly sortParam: string | undefined;
	setSort: (key: string) => void;
}

export function useTableSorter(options: TableSorterOptions): TableSorterResult {
	let sortKey = $state<string | null>(options.initialSortKey ?? null);
	let sortDirection = $state<'asc' | 'desc'>(options.initialSortDirection ?? 'desc');

	const sortParam = $derived(sortKey ? serializeSortParam(sortKey, sortDirection) : undefined);

	function setSort(key: string) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'desc';
		}
	}

	return {
		get sortKey() {
			return sortKey;
		},
		get sortDirection() {
			return sortDirection;
		},
		get sortParam() {
			return sortParam;
		},
		setSort
	};
}
