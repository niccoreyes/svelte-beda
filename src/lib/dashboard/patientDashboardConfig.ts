export type DashboardCardType =
	| 'appointments'
	| 'general-info'
	| 'summary'
	| 'notes'
	| 'conditions'
	| 'allergies'
	| 'medications'
	| 'immunizations'
	| 'procedures';

export interface DashboardCardConfig {
	type: DashboardCardType;
	title: string;
	visible: boolean;
	order: number;
}

export interface PatientDashboardConfig {
	cards: DashboardCardConfig[];
}

export function defaultPatientDashboardConfig(): PatientDashboardConfig {
	return {
		cards: [
			{ type: 'summary', title: 'Summary', visible: true, order: 0 },
			{ type: 'general-info', title: 'General Information', visible: true, order: 1 },
			{ type: 'appointments', title: 'Upcoming Appointments', visible: true, order: 2 },
			{ type: 'conditions', title: 'Conditions', visible: true, order: 3 },
			{ type: 'allergies', title: 'Allergies', visible: true, order: 4 },
			{ type: 'medications', title: 'Medications', visible: true, order: 5 },
			{ type: 'immunizations', title: 'Immunizations', visible: true, order: 6 },
			{ type: 'procedures', title: 'Procedures', visible: true, order: 7 },
			{ type: 'notes', title: 'Notes', visible: true, order: 8 }
		]
	};
}

export function validateConfig(config: unknown): PatientDashboardConfig {
	if (typeof config !== 'object' || config === null) {
		return defaultPatientDashboardConfig();
	}
	const c = config as Record<string, unknown>;
	const cards = Array.isArray(c.cards)
		? c.cards
				.filter(
					(card): card is DashboardCardConfig =>
						typeof card === 'object' &&
						card !== null &&
						'type' in card &&
						'title' in card &&
						typeof (card as Record<string, unknown>).type === 'string'
				)
				.map((card) => ({
					type: card.type,
					title: card.title,
					visible: typeof card.visible === 'boolean' ? card.visible : true,
					order: typeof card.order === 'number' ? card.order : 0
				}))
		: [];

	if (cards.length === 0) {
		return defaultPatientDashboardConfig();
	}

	return { cards };
}
