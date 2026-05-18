<script lang="ts">
	import type { Appointment, Bundle } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDateTime } from '$lib/utils';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import StartEncounterButton from '$lib/components/encounter/StartEncounterButton.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const appointmentsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Appointment', {
			patient: `Patient/${patientId}`,
			status: 'booked',
			_sort: 'date',
			_count: '5'
		});
	});

	$effect(() => {
		if (patientId) appointmentsState.reload();
	});

	const appointments = $derived(() => {
		if (appointmentsState.data.status !== 'success') return [];
		const bundle = appointmentsState.data.data;
		return (bundle.entry?.map((e) => e.resource as Appointment).filter(Boolean) || []) as Appointment[];
	});
</script>

<PatientDashboardCard
	title="Upcoming Appointments"
	loading={appointmentsState.data.status === 'loading'}
>
	{#if appointments().length === 0}
		<Empty message="No upcoming appointments" />
	{:else}
		<div class="space-y-3">
			{#each appointments() as appt (appt.id)}
				<div class="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-900 dark:text-white">
							{appt.serviceType?.[0]?.text ||
								appt.serviceType?.[0]?.coding?.[0]?.display ||
								'Appointment'}
						</span>
						<span
							class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
							>{appt.status}</span
						>
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">
						{appt.start
							? humanDateTime(appt.start)
							: '-'}
					</div>
					{#if appt.status === 'booked'}
						<div class="flex justify-end">
							<StartEncounterButton {patientId} variant="compact" />
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</PatientDashboardCard>
