import type { RemoteData } from '$lib/utils/remoteData';
import { success, failure } from '$lib/utils/remoteData';
import type { FhirResource, Bundle } from 'fhir/r4b';
import {
	createFHIRResource,
	getFHIRResource,
	updateFHIRResource,
	saveFHIRResource,
	patchFHIRResource,
	deleteFHIRResource,
	getFHIRResources,
	getAllFHIRResources,
	findFHIRResource,
	applyFHIRService,
	applyFHIRServices,
	loadResourceHistory,
	expandFHIRValueSet,
	expandExternalTerminology,
	expandEMRValueSet,
	generateUploadUrl,
	uploadFileWithXHR,
	generateDownloadUrl
} from './client';

async function wrap<T>(promise: Promise<T>): Promise<RemoteData<T, Error>> {
	try {
		const data = await promise;
		return success(data);
	} catch (err) {
		return failure(err instanceof Error ? err : new Error(String(err)));
	}
}

export async function remoteCreate<T extends FhirResource>(resource: T): Promise<RemoteData<T, Error>> {
	return wrap(createFHIRResource(resource));
}

export async function remoteRead<T extends FhirResource>(reference: string): Promise<RemoteData<T, Error>> {
	return wrap(getFHIRResource<T>({ reference }));
}

export async function remoteUpdate<T extends FhirResource>(resource: T): Promise<RemoteData<T, Error>> {
	return wrap(updateFHIRResource(resource));
}

export async function remoteSave<T extends FhirResource>(resource: T): Promise<RemoteData<T, Error>> {
	return wrap(saveFHIRResource(resource));
}

export async function remotePatch<T extends FhirResource>(
	resourceType: string,
	id: string,
	partialResource: Partial<T>
): Promise<RemoteData<T, Error>> {
	return wrap(patchFHIRResource<T>(resourceType, id, partialResource));
}

export async function remoteDelete<T extends FhirResource>(resource: T): Promise<RemoteData<void, Error>> {
	return wrap(deleteFHIRResource(resource));
}

export async function remoteForceDelete<T extends FhirResource>(resource: T): Promise<RemoteData<void, Error>> {
	if (!resource.id) {
		return failure(new Error('Resource must have an id to delete'));
	}
	return wrap(
		fetch(`${import.meta.env.VITE_FHIR_BASE_URL || 'https://cdr.fhirlab.net/fhir'}/${resource.resourceType}/${resource.id}?cascade=delete`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/fhir+json' }
		}).then((r) => {
			if (!r.ok) throw new Error(`Force delete failed: ${r.status}`);
		})
	);
}

export async function remoteSearch(resourceType: string, searchParams: Record<string, string | string[] | number | undefined>): Promise<RemoteData<Bundle, Error>> {
	return wrap(getFHIRResources(resourceType, searchParams));
}

export async function remoteSearchAll<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | string[] | number | undefined>
): Promise<RemoteData<T[], Error>> {
	return wrap(getAllFHIRResources<T>(resourceType, searchParams));
}

export async function remoteFind<T extends FhirResource>(
	resourceType: string,
	searchParams: Record<string, string | string[] | number | undefined>
): Promise<RemoteData<T | undefined, Error>> {
	return wrap(findFHIRResource<T>(resourceType, searchParams));
}

export async function remoteOperation<T>(url: string, method?: string, data?: unknown): Promise<RemoteData<T, Error>> {
	return wrap(applyFHIRService<T>({ url, method, data }));
}

export async function remoteBatch<T extends FhirResource>(operations: Array<{ url: string; method?: string; data?: unknown }>): Promise<RemoteData<{ entry?: Array<{ resource?: T }> }, Error>> {
	return wrap(applyFHIRServices<T>(operations));
}

export async function remoteHistory<T extends FhirResource>(reference: string): Promise<RemoteData<{ entry?: Array<{ resource?: T }> }, Error>> {
	return wrap(loadResourceHistory<T>({ reference }));
}

export async function remoteExpandValueSet(url: string, filterText?: string): Promise<RemoteData<{ entry?: Array<{ resource?: unknown }> }, Error>> {
	return wrap(expandFHIRValueSet(url, filterText));
}

export async function remoteExpandExternal(serverUrl: string, url: string, filterText?: string): Promise<RemoteData<{ entry?: Array<{ resource?: unknown }> }, Error>> {
	return wrap(expandExternalTerminology(serverUrl, url, filterText));
}

export async function remoteExpandEMR(url: string, filterText?: string, preferredServer?: string): Promise<RemoteData<{ entry?: Array<{ resource?: unknown }> }, Error>> {
	return wrap(expandEMRValueSet(url, filterText, preferredServer));
}

export async function remoteGenerateUploadUrl(filename: string): Promise<RemoteData<{ filename: string; uploadUrl: string }, Error>> {
	return wrap(generateUploadUrl(filename));
}

export function remoteUploadFile(options: { file: File; onProgress?: (progress: number) => void }, uploadUrl: string): Promise<RemoteData<void, Error>> {
	return wrap(uploadFileWithXHR(options, uploadUrl));
}

export async function remoteGenerateDownloadUrl(key: string): Promise<RemoteData<{ downloadUrl: string }, Error>> {
	return wrap(generateDownloadUrl(key));
}
