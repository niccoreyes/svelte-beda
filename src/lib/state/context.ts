import { setContext, getContext } from 'svelte';

export const MENU_LAYOUT_KEY = Symbol('menuLayout');
export const PATIENT_DASHBOARD_KEY = Symbol('patientDashboard');
export const WIDGET_REGISTRY_KEY = Symbol('widgetRegistry');
export const VALUESET_EXPAND_KEY = Symbol('valueSetExpand');

export function setMenuLayoutContext(value: unknown) {
	setContext(MENU_LAYOUT_KEY, value);
}

export function getMenuLayoutContext() {
	return getContext(MENU_LAYOUT_KEY);
}

export function setPatientDashboardContext(value: unknown) {
	setContext(PATIENT_DASHBOARD_KEY, value);
}

export function getPatientDashboardContext() {
	return getContext(PATIENT_DASHBOARD_KEY);
}

export function setWidgetRegistryContext(value: unknown) {
	setContext(WIDGET_REGISTRY_KEY, value);
}

export function getWidgetRegistryContext() {
	return getContext(WIDGET_REGISTRY_KEY);
}

export function setValueSetExpandContext(value: unknown) {
	setContext(VALUESET_EXPAND_KEY, value);
}

export function getValueSetExpandContext() {
	return getContext(VALUESET_EXPAND_KEY);
}
