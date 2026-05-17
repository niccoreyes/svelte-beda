import { saveFHIRResource, createFHIRResource } from '$lib/fhir/client';
import type { QuestionnaireResponse, Provenance } from 'fhir/r4b';

export interface SaveContext {
	authorReference?: string;
	patientReference?: string;
}

export async function persistSaveService(
	response: QuestionnaireResponse
): Promise<QuestionnaireResponse> {
	return saveFHIRResource(response);
}

export async function persistWithProvenanceSaveService(
	response: QuestionnaireResponse,
	context: SaveContext
): Promise<{ response: QuestionnaireResponse; provenance: Provenance }> {
	const savedResponse = await saveFHIRResource(response);

	const provenance: Provenance = {
		resourceType: 'Provenance',
		target: [{ reference: `QuestionnaireResponse/${savedResponse.id}` }],
		recorded: new Date().toISOString(),
		agent: [
			{
				who: context.authorReference
					? { reference: context.authorReference }
					: { reference: 'Practitioner/unknown' }
			}
		],
		activity: {
			coding: [
				{
					system: 'http://terminology.hl7.org/CodeSystem/v3-DataOperation',
					code: response.id ? 'UPDATE' : 'CREATE',
					display: response.id ? 'update' : 'create'
				}
			]
		}
	};

	const savedProvenance = await createFHIRResource(provenance);

	return { response: savedResponse, provenance: savedProvenance };
}
