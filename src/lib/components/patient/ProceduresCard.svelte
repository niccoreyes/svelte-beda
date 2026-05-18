<script lang="ts">
	import type { Bundle, Procedure } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate } from '$lib/utils';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const proceduresState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Procedure', {
			patient: `Patient/${patientId}`,
			_sort: '-date',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) proceduresState.reload();
	});

	const procedures = $derived(() => {
		if (proceduresState.data.status !== 'success') return [];
		const bundle = proceduresState.data.data;
		return (bundle.entry?.map((e) => e.resource as Procedure).filter(Boolean) || []) as Procedure[];
	});
</script>

<PatientDashboardCard title="Recent Procedures" loading={proceduresState.data.status === 'loading'}>
	{#if procedures().length === 0}
		<Empty message="No procedures recorded" />
	{:else}
		<div class="space-y-2">
			{#each procedures() as proc (proc.id)}
				<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<span class="text-sm text-gray-900 dark:text-white"
						>{proc.code?.text || proc.code?.coding?.[0]?.display || 'Unknown'}</span
					>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						{proc.performedDateTime
							? humanDate(proc.performedDateTime)
							: proc.performedPeriod?.start
								? humanDate(proc.performedPeriod.start)
								: '-'}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
