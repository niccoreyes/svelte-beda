import fhirpath from 'fhirpath';

export async function evaluateFhirPath(expression: string, context: unknown): Promise<unknown[]> {
	try {
		const result = fhirpath.evaluate(context, expression);
		return Promise.resolve(result);
	} catch (err) {
		console.error('FHIRPath evaluation error:', err);
		return [];
	}
}

export async function evaluateFhirPathSingle(expression: string, context: unknown): Promise<unknown | undefined> {
	const results = await evaluateFhirPath(expression, context);
	return results.length > 0 ? results[0] : undefined;
}
