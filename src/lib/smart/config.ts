export interface SmartAppConfig {
	id: string;
	name: string;
	url: string;
	icon?: string;
	description?: string;
}

/**
 * Whitelist of allowed SMART app URLs.
 * Only apps matching these URLs can be launched.
 */
export const SMART_APP_WHITELIST: string[] = [
	'http://localhost:3000',
	'https://launch.smarthealthit.org',
	'https://app.smarthealthit.org'
];

/**
 * Default SMART apps available in the EMR.
 */
export const DEFAULT_SMART_APPS: SmartAppConfig[] = [
	{
		id: 'cardiac-risk',
		name: 'Cardiac Risk Calculator',
		url: 'https://launch.smarthealthit.org/cardiac-risk',
		description: 'Calculate 10-year cardiovascular risk'
	},
	{
		id: 'growth-chart',
		name: 'Growth Chart',
		url: 'https://launch.smarthealthit.org/growth-chart',
		description: 'Pediatric growth percentile visualization'
	},
	{
		id: 'medication-reconciliation',
		name: 'Med Rec',
		url: 'https://launch.smarthealthit.org/med-rec',
		description: 'Medication reconciliation tool'
	}
];

/**
 * Check if a URL is in the SMART app whitelist.
 */
export function isSmartAppAllowed(url: string): boolean {
	try {
		const parsed = new URL(url);
		return SMART_APP_WHITELIST.some((allowed) => {
			if (allowed === parsed.origin) return true;
			if (allowed.endsWith('/') && parsed.href.startsWith(allowed)) return true;
			return parsed.href.startsWith(allowed + '/');
		});
	} catch {
		return false;
	}
}
