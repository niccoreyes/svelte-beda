export function getPatientName(patient: { name?: Array<{ given?: string[]; family?: string }> }): string {
	const name = patient.name?.[0];
	if (!name) return 'Unknown';
	const given = name.given?.join(' ') || '';
	const family = name.family || '';
	return `${given} ${family}`.trim() || 'Unknown';
}

export function getReferenceId(reference?: string): string | undefined {
	if (!reference) return undefined;
	return reference.split('/')[1];
}

export function buildReference(resourceType: string, id: string): string {
	return `${resourceType}/${id}`;
}

export function parseFHIRReference(reference: { reference?: string } | string): {
	resourceType?: string;
	id?: string;
} {
	const ref = typeof reference === 'string' ? reference : reference.reference;
	if (!ref) return {};
	const parts = ref.split('/');
	return { resourceType: parts[0], id: parts[1] };
}

export function extractBundleResources(bundle: { entry?: Array<{ resource?: unknown }> }): Record<string, unknown[]> {
	const result: Record<string, unknown[]> = {};
	for (const entry of bundle.entry || []) {
		const resource = entry.resource as { resourceType?: string } | undefined;
		if (resource && resource.resourceType) {
			const rt = resource.resourceType;
			if (!result[rt]) {
				result[rt] = [];
			}
			result[rt]!.push(resource);
		}
	}
	return result;
}
