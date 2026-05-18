<script lang="ts">
	import type { Bundle, MedicationRequest } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const medicationsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('MedicationRequest', {
			patient: `Patient/${patientId}`,
			status: 'active',
			_sort: '-authoredon',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) medicationsState.reload();
	});

	const medications = $derived(() => {
		if (medicationsState.data.status !== 'success') return [];
		const bundle = medicationsState.data.data;
		return (bundle.entry?.map((e) => e.resource as MedicationRequest).filter(Boolean) || []) as MedicationRequest[];
	});
</script>

<PatientDashboardCard title="Current Medications" loading={medicationsState.data.status === 'loading'}>
	{#if medications().length === 0}
		<Empty message="No active medications" />
	{:else}
		<div class="space-y-2">
			{#each medications() as med (med.id)}
				<div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<p class="text-sm font-medium text-gray-900 dark:text-white">
						{med.medicationCodeableConcept?.text ||
							med.medicationCodeableConcept?.coding?.[0]?.display ||
							'Unknown'}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						{med.dosageInstruction?.[0]?.text || ''}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
