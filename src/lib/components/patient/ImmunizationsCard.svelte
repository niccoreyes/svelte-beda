<script lang="ts">
	import type { Bundle, Immunization } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate } from '$lib/utils';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const immunizationsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Immunization', {
			patient: `Patient/${patientId}`,
			_sort: '-date',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) immunizationsState.reload();
	});

	const immunizations = $derived(() => {
		if (immunizationsState.data.status !== 'success') return [];
		const bundle = immunizationsState.data.data;
		return (bundle.entry?.map((e) => e.resource as Immunization).filter(Boolean) || []) as Immunization[];
	});
</script>

<PatientDashboardCard title="Immunizations" loading={immunizationsState.data.status === 'loading'}>
	{#if immunizations().length === 0}
		<Empty message="No immunizations recorded" />
	{:else}
		<div class="space-y-2">
			{#each immunizations() as imm (imm.id)}
				<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<span class="text-sm text-gray-900 dark:text-white"
						>{imm.vaccineCode?.text || imm.vaccineCode?.coding?.[0]?.display || 'Unknown'}</span
					>
					<span class="text-xs text-gray-500 dark:text-gray-400"
						>{imm.occurrenceDateTime ? humanDate(imm.occurrenceDateTime) : '-'}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
