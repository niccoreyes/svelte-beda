<script lang="ts">
	import type { Appointment, Bundle } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDateTime } from '$lib/utils';
	import Empty from '$lib/components/Empty.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import NewAppointmentModal from '$lib/components/calendar/NewAppointmentModal.svelte';

	interface Props {
		practitionerId: string;
	}

	let { practitionerId }: Props = $props();

	let modalOpen = $state(false);

	const appointmentsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Appointment', {
			practitioner: `Practitioner/${practitionerId}`,
			_sort: '-date',
			_count: '50'
		});
	});

	$effect(() => {
		if (practitionerId) {
			appointmentsState.reload();
		}
	});

	function getPatientNameFromAppointment(app: Appointment): string {
		const participant = app.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'));
		return participant?.actor?.display || participant?.actor?.reference || 'Unknown Patient';
	}

	function getStatusColor(status?: string): string {
		switch (status) {
			case 'booked':
			case 'arrived':
				return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
			case 'cancelled':
			case 'noshow':
				return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
			case 'fulfilled':
				return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
			case 'proposed':
			case 'pending':
			default:
				return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-gray-900 dark:text-white">Appointments</h3>
		<button
			class="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
			onclick={() => (modalOpen = true)}
		>
			New Appointment
		</button>
	</div>

	{#if appointmentsState.data.status === 'loading'}
		<div class="flex items-center justify-center h-48">
			<Spinner />
		</div>
	{:else if appointmentsState.data.status === 'failure'}
		<div class="p-4 text-red-600 dark:text-red-400">
			Error: {appointmentsState.data.error?.message || 'Unknown error'}
		</div>
	{:else if appointmentsState.data.status === 'success'}
		{@const bundle = appointmentsState.data.data}
		{@const appointments = bundle.entry?.map((e) => e.resource as Appointment).filter((r): r is Appointment => !!r) || []}
		{#if appointments.length > 0}
			<div class="space-y-2">
				{#each appointments as app}
					<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
								{app.description || app.serviceType?.[0]?.text || 'Appointment'}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								{getPatientNameFromAppointment(app)} · {app.start ? humanDateTime(app.start) : '-'}
							</p>
						</div>
						<span class="ml-3 px-2 py-0.5 rounded text-xs font-medium capitalize {getStatusColor(app.status)}">
							{app.status}
						</span>
					</div>
				{/each}
			</div>
		{:else}
			<Empty message="No appointments found" />
		{/if}
	{/if}
</div>

<NewAppointmentModal
	open={modalOpen}
	onClose={() => (modalOpen = false)}
	onCreated={() => {
		modalOpen = false;
		appointmentsState.reload();
	}}
/>
