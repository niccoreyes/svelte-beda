<script lang="ts">
	import type { Bundle, AllergyIntolerance } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const allergiesState = createServiceState<Bundle>(async () => {
		return getFHIRResources('AllergyIntolerance', {
			patient: `Patient/${patientId}`,
			_sort: '-date',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) allergiesState.reload();
	});

	const allergies = $derived(() => {
		if (allergiesState.data.status !== 'success') return [];
		const bundle = allergiesState.data.data;
		return (bundle.entry?.map((e) => e.resource as AllergyIntolerance).filter(Boolean) || []) as AllergyIntolerance[];
	});
</script>

<PatientDashboardCard title="Allergies" loading={allergiesState.data.status === 'loading'}>
	{#if allergies().length === 0}
		<Empty message="No allergies recorded" />
	{:else}
		<div class="space-y-2">
			{#each allergies() as allergy (allergy.id)}
				<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<span class="text-sm text-gray-900 dark:text-white"
						>{allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown'}</span
					>
					<span
						class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
						>{allergy.criticality || 'unknown'}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
