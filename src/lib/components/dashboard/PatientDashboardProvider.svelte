<script lang="ts" module>
	import { getContext, setContext } from 'svelte';

	const PATIENT_DASHBOARD_KEY = Symbol('patient-dashboard-config');

	export interface PatientDashboardConfig {
		patientId?: string;
		widgets?: string[];
		[key: string]: unknown;
	}

	export function setPatientDashboardConfig(config: PatientDashboardConfig) {
		setContext(PATIENT_DASHBOARD_KEY, config);
	}

	export function getPatientDashboardConfig(): PatientDashboardConfig | undefined {
		return getContext<PatientDashboardConfig>(PATIENT_DASHBOARD_KEY);
	}
</script>

<script lang="ts">
	interface Props {
		config: PatientDashboardConfig;
		children?: import('svelte').Snippet;
	}

	let { config, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	setPatientDashboardConfig(config);
</script>

{@render children?.()}
