import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
import { evaluateFhirPathSingle } from '$lib/utils/fhirpathEval';

export interface LaunchContext {
	name: string;
	resource: unknown;
}

const CALCULATED_EXPRESSION_URL = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression';
const INITIAL_EXPRESSION_URL = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression';

export function getCalculatedExpression(item: QuestionnaireItem): string | undefined {
	const ext = item.extension?.find((e) => e.url === CALCULATED_EXPRESSION_URL);
	return ext?.valueExpression?.expression;
}

export function getInitialExpression(item: QuestionnaireItem): string | undefined {
	const ext = item.extension?.find((e) => e.url === INITIAL_EXPRESSION_URL);
	return ext?.valueExpression?.expression;
}

export async function evaluateExpression(
	expression: string,
	questionnaireResponse: unknown,
	launchContext: LaunchContext[] = []
): Promise<unknown | undefined> {
	// Build a combined context with launch context resources
	const context: Record<string, unknown> = { ...questionnaireResponse as Record<string, unknown> };
	for (const lc of launchContext) {
		context[`%${lc.name}`] = lc.resource;
	}
	return evaluateFhirPathSingle(expression, context);
}

export function expressionResultToAnswer(
	result: unknown,
	itemType: string
): QuestionnaireResponseItemAnswer | undefined {
	if (result === undefined || result === null) return undefined;

	switch (itemType) {
		case 'string':
		case 'text':
			return { valueString: String(result) };
		case 'integer':
			return { valueInteger: Number(result) };
		case 'decimal':
			return { valueDecimal: Number(result) };
		case 'boolean':
			return { valueBoolean: Boolean(result) };
		case 'date':
			return { valueDate: String(result) };
		case 'dateTime':
			return { valueDateTime: String(result) };
		case 'time':
			return { valueTime: String(result) };
		case 'quantity':
			if (typeof result === 'object' && result !== null && 'value' in result) {
				return { valueQuantity: result as { value: number; unit?: string } };
			}
			return { valueQuantity: { value: Number(result) } };
		default:
			return { valueString: String(result) };
	}
}

export function buildLaunchContext(params?: Array<{ name: string; resource: unknown }>): LaunchContext[] {
	return params?.map((p) => ({ name: p.name, resource: p.resource })) ?? [];
}
