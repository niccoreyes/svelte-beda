import { getFHIRResources } from '$lib/fhir/client';
import type { FhirResource } from 'fhir/r4b';

export interface PagerState<T> {
	currentPage: number;
	totalPages: number;
	resources: T[];
	loadPage: (page: number) => Promise<void>;
	reload: () => Promise<void>;
}

export function createPager<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | number | undefined>,
	resourcesOnPage: number = 10
): PagerState<T> {
	let currentPage = $state(1);
	let totalPages = $state(1);
	let resources = $state<T[]>([]);

	async function loadPage(page: number) {
		currentPage = page;
		const params = { ...searchParams, _count: resourcesOnPage, _page: page };
		const bundle = await getFHIRResources<T>(resourceType, params);
		resources = bundle.entry?.map((e) => e.resource as T | undefined).filter((r): r is T => !!r) || [];
		totalPages = Math.ceil((bundle.total || 0) / resourcesOnPage);
	}

	return {
		get currentPage() {
			return currentPage;
		},
		get totalPages() {
			return totalPages;
		},
		get resources() {
			return resources;
		},
		loadPage,
		reload: () => loadPage(currentPage)
	};
}

export function createExtendedPager<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | number | undefined>,
	resourcesOnPage: number = 10
) {
	const pager = createPager<T>(resourceType, searchParams, resourcesOnPage);

	return {
		...pager,
		handleTableChange: (pagination: { pageIndex: number }) => {
			pager.loadPage(pagination.pageIndex + 1);
		}
	};
}
