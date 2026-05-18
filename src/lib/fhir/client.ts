import { config } from '$lib/config';
import type { Bundle, Resource, FhirResource } from 'fhir/r4b';

const FHIR_BASE_URL = config.fhirBaseURL;

function getAuthHeaders(): Record<string, string> {
	if (typeof window === 'undefined') return {};
	const token = localStorage.getItem('beda_access_token');
	return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fhirRequest<T>({
	url,
	method = 'GET',
	body,
	headers = {}
}: {
	url: string;
	method?: string;
	body?: unknown;
	headers?: Record<string, string>;
}): Promise<T> {
	const response = await fetch(`${FHIR_BASE_URL}${url}`, {
		method,
		headers: {
			'Content-Type': 'application/fhir+json',
			Accept: 'application/fhir+json',
			...getAuthHeaders(),
			...headers
		},
		body: body ? JSON.stringify(body) : undefined
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`FHIR request failed: ${response.status} ${response.statusText} - ${errorText}`);
	}

	return response.json() as Promise<T>;
}

export async function createFHIRResource<T extends FhirResource>(resource: T): Promise<T> {
	return fhirRequest<T>({
		url: `/${resource.resourceType}`,
		method: 'POST',
		body: resource
	});
}

export async function getFHIRResource<T extends FhirResource>({
	reference
}: {
	reference: string;
}): Promise<T> {
	const [resourceType, id] = reference.split('/');
	return fhirRequest<T>({
		url: `/${resourceType}/${id}`
	});
}

export async function updateFHIRResource<T extends FhirResource>(resource: T): Promise<T> {
	if (!resource.id) {
		throw new Error('Resource must have an id to update');
	}
	return fhirRequest<T>({
		url: `/${resource.resourceType}/${resource.id}`,
		method: 'PUT',
		body: resource
	});
}

export async function saveFHIRResource<T extends FhirResource>(resource: T): Promise<T> {
	if (resource.id) {
		return updateFHIRResource(resource);
	}
	return createFHIRResource(resource);
}

export async function patchFHIRResource<T extends FhirResource>(
	resourceType: string,
	id: string,
	partialResource: Partial<T>
): Promise<T> {
	return fhirRequest<T>({
		url: `/${resourceType}/${id}`,
		method: 'PATCH',
		body: partialResource,
		headers: { 'Content-Type': 'application/json-patch+json' }
	});
}

export async function deleteFHIRResource<T extends FhirResource>(resource: T): Promise<void> {
	if (!resource.id) {
		throw new Error('Resource must have an id to delete');
	}
	await fhirRequest<void>({
		url: `/${resource.resourceType}/${resource.id}`,
		method: 'DELETE'
	});
}

export async function forceDeleteFHIRResource<T extends FhirResource>(resource: T): Promise<void> {
	if (!resource.id) {
		throw new Error('Resource must have an id to delete');
	}
	await fhirRequest<void>({
		url: `/${resource.resourceType}/${resource.id}?cascade=delete`,
		method: 'DELETE'
	});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getFHIRResources<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | string[] | number | undefined> = {}
): Promise<Bundle> {
	const params = new URLSearchParams();
	Object.entries(searchParams).forEach(([key, value]) => {
		if (value !== undefined) {
			if (Array.isArray(value)) {
				value.forEach((v) => params.append(key, String(v)));
			} else {
				params.append(key, String(value));
			}
		}
	});
	const queryString = params.toString();
	return fhirRequest<Bundle>({
		url: `/${resourceType}${queryString ? `?${queryString}` : ''}`
	});
}

export async function getAllFHIRResources<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | string[] | number | undefined> = {}
): Promise<T[]> {
	const allResources: T[] = [];
	let nextUrl: string | undefined = `/${resourceType}?${new URLSearchParams(
		Object.entries(searchParams)
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => [k, String(v)])
	).toString()}`;

	while (nextUrl) {
		const bundle: { entry?: Array<{ resource?: T }>; total?: number; link?: Array<{ relation: string; url: string }> } = await fhirRequest<{ entry?: Array<{ resource?: T }>; total?: number; link?: Array<{ relation: string; url: string }> }>({ url: nextUrl.replace(FHIR_BASE_URL, '') });
		if (bundle.entry) {
			allResources.push(...bundle.entry.map((e: { resource?: T }) => e.resource as T).filter(Boolean));
		}
		const nextLink: { relation: string; url: string } | undefined = bundle.link?.find((l: { relation: string; url: string }) => l.relation === 'next');
		nextUrl = nextLink?.url ? nextLink.url.replace(FHIR_BASE_URL, '') : undefined;
	}

	return allResources;
}

export async function findFHIRResource<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | string[] | number | undefined> = {}
): Promise<T | undefined> {
	const bundle = await getFHIRResources<T>(resourceType, { ...searchParams, _count: 1 });
	return bundle.entry?.[0]?.resource as T | undefined;
}

export async function applyFHIRService<T>({
	url,
	method = 'GET',
	data
}: {
	url: string;
	method?: string;
	data?: unknown;
}): Promise<T> {
	return fhirRequest<T>({ url, method, body: data });
}

export async function applyFHIRServices<T extends FhirResource>(operations: Array<{ url: string; method?: string; data?: unknown }>): Promise<{ entry?: Array<{ resource?: T }> }> {
	const bundle = {
		resourceType: 'Bundle',
		type: 'transaction',
		entry: operations.map((op) => ({
			request: {
				method: op.method || 'GET',
				url: op.url,
				...(op.data ? { resource: op.data as Resource } : {})
			}
		}))
	};
	return fhirRequest<{ entry?: Array<{ resource?: T }> }>({ url: '/', method: 'POST', body: bundle });
}

export async function loadResourceHistory<T extends FhirResource>({
	reference
}: {
	reference: string;
}): Promise<{ entry?: Array<{ resource?: T }> }> {
	const [resourceType, id] = reference.split('/');
	return fhirRequest<{ entry?: Array<{ resource?: T }> }>({
		url: `/${resourceType}/${id}/_history`
	});
}

export async function expandFHIRValueSet(url: string, filterText?: string): Promise<{ entry?: Array<{ resource?: unknown }> }> {
	const params = new URLSearchParams({ url });
	if (filterText) params.append('filter', filterText);
	return fhirRequest<Bundle>({
		url: `/ValueSet/$expand?${params.toString()}`
	});
}

export async function expandExternalTerminology(
	serverUrl: string,
	url: string,
	filterText?: string
): Promise<{ entry?: Array<{ resource?: unknown }> }> {
	const params = new URLSearchParams({ url });
	if (filterText) params.append('filter', filterText);
	const response = await fetch(`${serverUrl}/ValueSet/$expand?${params.toString()}`, {
		headers: { Accept: 'application/fhir+json' }
	});
	if (!response.ok) throw new Error(`External terminology expansion failed: ${response.status}`);
	return response.json();
}

export async function expandEMRValueSet(
	url: string,
	filterText?: string,
	preferredServer?: string
): Promise<{ entry?: Array<{ resource?: unknown }> }> {
	try {
		if (preferredServer) {
			return await expandExternalTerminology(preferredServer, url, filterText);
		}
		return await expandFHIRValueSet(url, filterText);
	} catch {
		if (config.terminologyServer && config.terminologyServer !== FHIR_BASE_URL) {
			return expandExternalTerminology(config.terminologyServer, url, filterText);
		}
		throw new Error(`ValueSet expansion failed for ${url}`);
	}
}

export async function generateUploadUrl(filename: string): Promise<{ filename: string; uploadUrl: string }> {
	const response = await fhirRequest<{ filename: string; uploadUrl: string }>({
		url: '/$generate-upload-url',
		method: 'POST',
		body: { filename }
	});
	return response;
}

export function uploadFileWithXHR(
	options: { file: File; onProgress?: (progress: number) => void },
	uploadUrl: string
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', uploadUrl);
		xhr.setRequestHeader('Content-Type', 'application/octet-stream');
		if (options.onProgress) {
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable) {
					options.onProgress?.((e.loaded / e.total) * 100);
				}
			};
		}
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(new Error(`Upload failed: ${xhr.status}`));
		};
		xhr.onerror = () => reject(new Error('Upload failed'));
		xhr.send(options.file);
	});
}

export async function generateDownloadUrl(key: string): Promise<{ downloadUrl: string }> {
	return fhirRequest<{ downloadUrl: string }>({
		url: '/$generate-download-url',
		method: 'POST',
		body: { key }
	});
}
