<script lang="ts">
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import ScheduleCalendar from '$lib/components/calendar/ScheduleCalendar.svelte';
	import NewAppointmentModal from '$lib/components/calendar/NewAppointmentModal.svelte';
	import { searchAppointments } from '$lib/calendar/appointment';
	import { createServiceState } from '$lib/state/serviceState.svelte';
	import { isSuccess, isLoading } from '$lib/state/remoteData';
	import { getAllFHIRResources } from '$lib/fhir/client';
	import type { Appointment, Patient, Practitioner, HealthcareService } from 'fhir/r4b';
	import { format, parseISO } from 'date-fns';

	type ViewMode = 'calendar' | 'list';

	let viewMode = $state<ViewMode>('calendar');
	let selectedAppointment = $state<Appointment | null>(null);
	let showNewModal = $state(false);
	let modalInitialDate = $state<string | undefined>(undefined);
	let modalInitialEndDate = $state<string | undefined>(undefined);

	const appointmentsState = createServiceState<Appointment[]>(async () => {
		return searchAppointments({ _count: 100 });
	});

	const patientsState = createServiceState<Patient[]>(async () => {
		return getAllFHIRResources<Patient>('Patient', { _count: 100 });
	});

	const practitionersState = createServiceState<Practitioner[]>(async () => {
		return getAllFHIRResources<Practitioner>('Practitioner', { _count: 100 });
	});

	const servicesState = createServiceState<HealthcareService[]>(async () => {
		return getAllFHIRResources<HealthcareService>('HealthcareService', { _count: 100 });
	});

	$effect(() => {
		appointmentsState.reload();
		patientsState.reload();
		practitionersState.reload();
		servicesState.reload();
	});

	function handleEventClick(appointment: Appointment) {
		selectedAppointment = appointment;
	}

	function handleDateSelect(start: Date, end: Date) {
		modalInitialDate = start.toISOString();
		modalInitialEndDate = end.toISOString();
		showNewModal = true;
	}

	function handleNewAppointment() {
		modalInitialDate = undefined;
		modalInitialEndDate = undefined;
		showNewModal = true;
	}

	function handleAppointmentCreated() {
		appointmentsState.reload();
		showNewModal = false;
	}

	function getAppointmentStatusColor(status: string | undefined): string {
		switch (status) {
			case 'booked':
			case 'arrived':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
			case 'proposed':
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
			case 'cancelled':
			case 'noshow':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
			case 'fulfilled':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
		}
	}

	const appointments = $derived(
		isSuccess(appointmentsState.data) ? appointmentsState.data.data : []
	);
</script>

<PageContainer title="Scheduling" variant="default">
	{#snippet titleRightElement()}
		<div class="flex items-center gap-3">
			<div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
				<button
					class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'calendar'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					onclick={() => (viewMode = 'calendar')}
				>
					Calendar
				</button>
				<button
					class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'list'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					onclick={() => (viewMode = 'list')}
				>
					List
				</button>
			</div>
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
				onclick={handleNewAppointment}
			>
				+ New Appointment
			</button>
		</div>
	{/snippet}

	{#if isLoading(appointmentsState.data)}
		<Spinner />
	{:else if appointments.length === 0}
		<Empty message="No appointments found" illustration="calendar" />
	{:else if viewMode === 'calendar'}
		<ScheduleCalendar
			appointments={appointments}
			onEventClick={handleEventClick}
			onDateSelect={handleDateSelect}
		/>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date & Time</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Patient</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Practitioner</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Service</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each appointments as app}
						{@const patient = app.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'))}
						{@const practitioner = app.participant?.find((p) => p.actor?.reference?.startsWith('Practitioner/'))}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onclick={() => handleEventClick(app)}>
							<td class="px-4 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
								{#if app.start}
									<div class="font-medium">{format(parseISO(app.start), 'MMM d, yyyy')}</div>
									<div class="text-gray-500 dark:text-gray-400 text-xs">
										{format(parseISO(app.start), 'h:mm a')}
										{#if app.end}
											 — {format(parseISO(app.end), 'h:mm a')}
										{/if}
									</div>
								{:else}
									<span class="text-gray-400">—</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-gray-900 dark:text-gray-100">
								{patient?.actor?.display || patient?.actor?.reference || '—'}
							</td>
							<td class="px-4 py-3 text-gray-900 dark:text-gray-100">
								{practitioner?.actor?.display || practitioner?.actor?.reference || '—'}
							</td>
							<td class="px-4 py-3 text-gray-900 dark:text-gray-100">
								{app.serviceType?.[0]?.text || '—'}
							</td>
							<td class="px-4 py-3">
								<span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {getAppointmentStatusColor(app.status)}">
									{app.status || 'unknown'}
								</span>
							</td>
							<td class="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
								{app.description || '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</PageContainer>

{#if showNewModal}
	<NewAppointmentModal
		open={showNewModal}
		patients={isSuccess(patientsState.data) ? patientsState.data.data : []}
		practitioners={isSuccess(practitionersState.data) ? practitionersState.data.data : []}
		services={isSuccess(servicesState.data) ? servicesState.data.data : []}
		initialDate={modalInitialDate}
		initialEndDate={modalInitialEndDate}
		onClose={() => {
			showNewModal = false;
			modalInitialDate = undefined;
			modalInitialEndDate = undefined;
		}}
		onCreated={handleAppointmentCreated}
	/>
{/if}

{#if selectedAppointment}
	<div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
		<button
			class="absolute inset-0 bg-black/50"
			onclick={() => (selectedAppointment = null)}
			aria-label="Close details"
		></button>
		<div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Appointment Details</h2>
				<button
					onclick={() => (selectedAppointment = null)}
					class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4 space-y-4">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
					<span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {getAppointmentStatusColor(selectedAppointment.status)}">
						{selectedAppointment.status || 'unknown'}
					</span>
				</div>
				{#if selectedAppointment.start}
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Start</span>
						<span class="text-sm text-gray-900 dark:text-white">
							{format(parseISO(selectedAppointment.start), 'PPp')}
						</span>
					</div>
				{/if}
				{#if selectedAppointment.end}
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-500 dark:text-gray-400">End</span>
						<span class="text-sm text-gray-900 dark:text-white">
							{format(parseISO(selectedAppointment.end), 'PPp')}
						</span>
					</div>
				{/if}
				{#if selectedAppointment.serviceType?.[0]?.text}
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Service</span>
						<span class="text-sm text-gray-900 dark:text-white">{selectedAppointment.serviceType[0].text}</span>
					</div>
				{/if}
				{#if selectedAppointment.description}
					<div>
						<span class="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Description</span>
						<p class="text-sm text-gray-900 dark:text-white">{selectedAppointment.description}</p>
					</div>
				{/if}
				<div>
					<span class="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Participants</span>
					<ul class="space-y-1">
						{#each selectedAppointment.participant || [] as participant}
							<li class="text-sm text-gray-900 dark:text-white">
								{participant.actor?.display || participant.actor?.reference || 'Unknown'}
								<span class="text-gray-500 dark:text-gray-400">({participant.status})</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}
