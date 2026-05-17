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
