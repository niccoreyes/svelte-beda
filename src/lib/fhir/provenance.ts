import { applyFHIRService } from './client';
import type { Bundle } from 'fhir/r4b';

export async function queryProvenanceBySource(resource: { resourceType: string; id: string }): Promise<Bundle> {
	return applyFHIRService<Bundle>({
		url: `/$query/provenance-by-source?source=${resource.resourceType}/${resource.id}`
	});
}

export async function queryProvenanceByTarget(resource: { resourceType: string; id: string }): Promise<Bundle> {
	return applyFHIRService<Bundle>({
		url: `/$query/provenance-by-target?target=${resource.resourceType}/${resource.id}`
	});
}
