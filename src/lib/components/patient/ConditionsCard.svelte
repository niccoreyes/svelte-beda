<script lang="ts">
	import type { Bundle, Condition } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const conditionsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Condition', {
			patient: `Patient/${patientId}`,
			'clinical-status': 'active',
			_sort: '-onset-date',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) conditionsState.reload();
	});

	const conditions = $derived(() => {
		if (conditionsState.data.status !== 'success') return [];
		const bundle = conditionsState.data.data;
		return (bundle.entry?.map((e) => e.resource as Condition).filter(Boolean) || []) as Condition[];
	});
</script>

<PatientDashboardCard title="Active Conditions" loading={conditionsState.data.status === 'loading'}>
	{#if conditions().length === 0}
		<Empty message="No active conditions" />
	{:else}
		<div class="space-y-2">
			{#each conditions() as condition}
				<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<span class="text-sm text-gray-900 dark:text-white"
						>{condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown'}</span
					>
					<span
						class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
						>{condition.clinicalStatus?.coding?.[0]?.code ||
							condition.clinicalStatus?.text ||
							'active'}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
