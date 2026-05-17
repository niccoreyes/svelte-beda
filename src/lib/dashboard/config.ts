export interface DashboardWidgetConfig {
	type: string;
	title: string;
	query?: string;
	resourceType?: string;
	position?: {
		x?: number;
		y?: number;
		w?: number;
		h?: number;
	};
	settings?: Record<string, unknown>;
}

export interface DashboardConfig {
	id?: string;
	name: string;
	widgets: DashboardWidgetConfig[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
	name: 'Main Dashboard',
	widgets: [
		{ type: 'patients', title: 'Recent Patients', resourceType: 'Patient', position: { x: 0, y: 0, w: 1, h: 1 } },
		{ type: 'appointments', title: 'Today\'s Appointments', resourceType: 'Appointment', position: { x: 1, y: 0, w: 1, h: 1 } },
		{ type: 'encounters', title: 'Recent Encounters', resourceType: 'Encounter', position: { x: 2, y: 0, w: 1, h: 1 } },
		{ type: 'medications', title: 'Pending Medications', resourceType: 'MedicationRequest', position: { x: 0, y: 1, w: 1, h: 1 } }
	]
};

export function validateDashboardConfig(config: unknown): DashboardConfig {
	if (typeof config !== 'object' || config === null) {
		return DEFAULT_DASHBOARD_CONFIG;
	}
	const c = config as Record<string, unknown>;
	const widgets = Array.isArray(c.widgets)
		? c.widgets
				.filter((w): w is DashboardWidgetConfig => typeof w === 'object' && w !== null && 'type' in w && 'title' in w)
				.map((w) => w as DashboardWidgetConfig)
		: [];
	return {
		id: typeof c.id === 'string' ? c.id : undefined,
		name: typeof c.name === 'string' ? c.name : 'Dashboard',
		widgets
	};
}
