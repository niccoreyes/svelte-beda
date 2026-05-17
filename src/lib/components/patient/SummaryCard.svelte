<script lang="ts">
	import type { Bundle, Encounter } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate } from '$lib/utils';
	import PatientDashboardCard from './PatientDashboardCard.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const conditionsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Condition', {
			patient: `Patient/${patientId}`,
			'clinical-status': 'active',
			_count: '1'
		});
	});

	const allergiesState = createServiceState<Bundle>(async () => {
		return getFHIRResources('AllergyIntolerance', {
			patient: `Patient/${patientId}`,
			_count: '1'
		});
	});

	const medicationsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('MedicationRequest', {
			patient: `Patient/${patientId}`,
			status: 'active',
			_count: '1'
		});
	});

	const encountersState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Encounter', {
			patient: `Patient/${patientId}`,
			_sort: '-date',
			_count: '1'
		});
	});

	$effect(() => {
		if (patientId) {
			conditionsState.reload();
			allergiesState.reload();
			medicationsState.reload();
			encountersState.reload();
		}
	});

	const counts = $derived(() => {
		const conditionsCount =
			conditionsState.data.status === 'success'
				? (conditionsState.data.data.total ?? conditionsState.data.data.entry?.length ?? 0)
				: 0;
		const allergiesCount =
			allergiesState.data.status === 'success'
				? (allergiesState.data.data.total ?? allergiesState.data.data.entry?.length ?? 0)
				: 0;
		const medicationsCount =
			medicationsState.data.status === 'success'
				? (medicationsState.data.data.total ?? medicationsState.data.data.entry?.length ?? 0)
				: 0;
		const lastEncounter =
			encountersState.data.status === 'success'
				? (encountersState.data.data.entry?.[0]?.resource as Encounter)?.period?.start
				: undefined;
		return { conditionsCount, allergiesCount, medicationsCount, lastEncounter };
	});
</script>

<PatientDashboardCard
	title="Summary"
	loading={conditionsState.data.status === 'loading' && allergiesState.data.status === 'loading'}
>
	<div class="grid grid-cols-2 gap-3">
		<div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
			<p class="text-xl font-semibold text-blue-600 dark:text-blue-400">{counts().conditionsCount}</p>
			<p class="text-xs text-blue-600/80 dark:text-blue-400/80">Active Conditions</p>
		</div>
		<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
			<p class="text-xl font-semibold text-red-600 dark:text-red-400">{counts().allergiesCount}</p>
			<p class="text-xs text-red-600/80 dark:text-red-400/80">Allergies</p>
		</div>
		<div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
			<p class="text-xl font-semibold text-green-600 dark:text-green-400">{counts().medicationsCount}</p>
			<p class="text-xs text-green-600/80 dark:text-green-400/80">Active Medications</p>
		</div>
		<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
			<p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
				{counts().lastEncounter ? humanDate(counts().lastEncounter) : '-'}
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-400">Last Encounter</p>
		</div>
	</div>
</PatientDashboardCard>
