import { getContext, setContext } from 'svelte';
import type { DashboardConfig } from './config';

const DASHBOARD_CONTEXT_KEY = Symbol('dashboard-config');

export function setDashboardConfig(config: DashboardConfig) {
	setContext(DASHBOARD_CONTEXT_KEY, config);
}

export function getDashboardConfig(): DashboardConfig | undefined {
	return getContext<DashboardConfig>(DASHBOARD_CONTEXT_KEY);
}
