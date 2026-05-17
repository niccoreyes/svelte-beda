export interface SmartLaunchContext {
	patient?: string;
	encounter?: string;
	user?: string;
	launch?: string;
	iss: string;
}

/**
 * Generate a SMART launch context object with patient, encounter, and user IDs.
 * Returns a JWT-like base64-encoded context string or plain object.
 */
export function generateSmartLaunchContext(
	patientId: string,
	encounterId?: string,
	userId?: string
): SmartLaunchContext {
	const context: SmartLaunchContext = {
		patient: patientId,
		iss: typeof window !== 'undefined' ? window.location.origin : ''
	};
	if (encounterId) context.encounter = encounterId;
	if (userId) context.user = userId;
	return context;
}

/**
 * Encode a SMART launch context as a base64 JWT-like string.
 */
export function encodeLaunchContext(context: SmartLaunchContext): string {
	const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
	const payload = btoa(JSON.stringify(context));
	return `${header}.${payload}.`;
}

/**
 * Decode a SMART launch context from a base64 JWT-like string.
 */
export function decodeLaunchContext(token: string): SmartLaunchContext | null {
	try {
		const parts = token.split('.');
		if (parts.length < 2 || !parts[1]) return null;
		const payload = JSON.parse(atob(parts[1]));
		return payload as SmartLaunchContext;
	} catch {
		return null;
	}
}

/**
 * Build a launch URL for a SMART app with the given context.
 * Appends launch and iss parameters to the app URL.
 */
export function buildLaunchUrl(appUrl: string, context: SmartLaunchContext | string): string {
	const url = new URL(appUrl);
	const ctx = typeof context === 'string' ? context : encodeLaunchContext(context);
	url.searchParams.set('launch', ctx);
	url.searchParams.set('iss', typeof window !== 'undefined' ? window.location.origin : url.origin);
	return url.toString();
}
