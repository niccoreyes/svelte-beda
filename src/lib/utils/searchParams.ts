import type { FilterConfig } from '$lib/components/SearchBar.svelte';

export function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== '') {
			searchParams.append(key, String(value));
		}
	});
	return searchParams.toString();
}

export function serializeDateFilter(date: string, prefix: string = 'eq'): string {
	return `${prefix}${date}`;
}

export function serializeSortParam(field: string, direction: 'asc' | 'desc'): string {
	return direction === 'desc' ? `-${field}` : field;
}

export function serializeFilters(filters: FilterConfig[]): Record<string, string | string[]> {
	const result: Record<string, string | string[]> = {};
	for (const filter of filters) {
		const serialized = serializeFilterValue(filter);
		if (serialized !== undefined) {
			result[filter.id] = serialized;
		}
	}
	return result;
}

export function serializeFilterValue(filter: FilterConfig): string | string[] | undefined {
	const { type, value, resourceType, delimiter } = filter;
	if (!value || value === '') return undefined;

	switch (type) {
		case 'STRING':
			return value;
		case 'DATE': {
			try {
				const parsed = JSON.parse(value) as { start?: string; end?: string };
				const parts: string[] = [];
				if (parsed.start) parts.push(`ge${parsed.start}`);
				if (parsed.end) parts.push(`le${parsed.end}`);
				return parts.length > 0 ? parts : undefined;
			} catch {
				return undefined;
			}
		}
		case 'SINGLEDATE':
			return `eq${value}`;
		case 'REFERENCE': {
			if (value.includes('/')) return value;
			return resourceType ? `${resourceType}/${value}` : value;
		}
		case 'CHOICE':
		case 'SOLIDCHOICE':
		case 'VALUESET':
			return value;
		case 'SELECTCHOICE': {
			try {
				const parsed = JSON.parse(value) as string[];
				return parsed.length > 0 ? parsed : undefined;
			} catch {
				return value ? [value] : undefined;
			}
		}
		case 'SPLITSTRING': {
			const parts = value.split(delimiter || ',').map((v) => v.trim()).filter(Boolean);
			return parts.length > 0 ? parts : undefined;
		}
		default:
			return value;
	}
}
