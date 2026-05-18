<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource, getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Practitioner, Appointment, Bundle } from 'fhir/r4b';
	import PractitionerAvailabilityCalendar from '$lib/components/practitioner/PractitionerAvailabilityCalendar.svelte';
	import PractitionerScheduleList from '$lib/components/practitioner/PractitionerScheduleList.svelte';

	const id = $page.params.id;

	const practitionerState = createServiceState<Practitioner>(async () => {
		return getFHIRResource<Practitioner>({ reference: `Practitioner/${id}` });
	});

	const appointmentsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Appointment', {
			practitioner: `Practitioner/${id}`,
			_sort: '-date',
			_count: '100'
		});
	});

	let activeTab = $state('overview');

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'scheduling', label: 'Scheduling' },
		{ id: 'availability', label: 'Availability' }
	];

	$effect(() => {
		practitionerState.reload();
		appointmentsState.reload();
	});

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	// Availability slots stored in localStorage
	interface AvailabilitySlot {
		id: string;
		dayOfWeek: number;
		startTime: string;
		endTime: string;
	}

	let availabilitySlots = $state<AvailabilitySlot[]>([]);
	let newSlotDay = $state(1);
	let newSlotStart = $state('09:00');
	let newSlotEnd = $state('17:00');

	$effect(() => {
		if (typeof window !== 'undefined' && id) {
			const stored = localStorage.getItem(`practitioner_availability_${id}`);
			if (stored) {
				try {
					availabilitySlots = JSON.parse(stored);
				} catch {
					availabilitySlots = [];
				}
			}
		}
	});

	function saveAvailability() {
		if (typeof window !== 'undefined' && id) {
			localStorage.setItem(`practitioner_availability_${id}`, JSON.stringify(availabilitySlots));
		}
	}

	function addSlot() {
		const slot: AvailabilitySlot = {
			id: crypto.randomUUID(),
			dayOfWeek: newSlotDay,
			startTime: newSlotStart,
			endTime: newSlotEnd
		};
		availabilitySlots = [...availabilitySlots, slot];
		saveAvailability();
	}

	function removeSlot(slotId: string) {
		availabilitySlots = availabilitySlots.filter((s) => s.id !== slotId);
		saveAvailability();
	}

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	const appointments = $derived(
		appointmentsState.data.status === 'success'
			? (appointmentsState.data.data.entry?.map((e) => e.resource as Appointment).filter((r): r is Appointment => !!r) || [])
			: []
	);
</script>

{#if practitionerState.data.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if practitionerState.data.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading practitioner: {practitionerState.data.error?.message || 'Unknown error'}</p>
	</div>
{:else if practitionerState.data.status === 'success'}
	{@const practitioner = practitionerState.data.data}
	<PageContainer title={getPractitionerName(practitioner)} variant="with-tabs">
		{#snippet headerContent()}
			<div class="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
			{#each tabs as tab (tab.id)}
				<button
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					onclick={() => activeTab = tab.id}
				>
					{tab.label}
				</button>
			{/each}
			</div>
		{/snippet}

		{#if activeTab === 'overview'}
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Name</p>
						<p class="text-lg font-medium">{getPractitionerName(practitioner)}</p>
					</div>
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Gender</p>
						<p class="text-lg font-medium">{practitioner.gender || '-'}</p>
					</div>
				</div>
				{#if practitioner.telecom && practitioner.telecom.length > 0}
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Contact</p>
					{#each practitioner.telecom as telecom, i (i)}
						<p>{telecom.system}: {telecom.value}</p>
					{/each}
					</div>
				{/if}
			</div>
		{:else if activeTab === 'scheduling'}
			<PractitionerScheduleList practitionerId={id!} />
		{:else if activeTab === 'availability'}
			<div class="space-y-6">
				<PractitionerAvailabilityCalendar
					practitionerId={id!}
					{appointments}
					{availabilitySlots}
				/>

				<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
					<h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manage Availability Slots</h4>

					<div class="flex flex-wrap items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<div class="flex flex-col gap-1">
							<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="slot-day">Day</label>
							<select
								id="slot-day"
								class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
								bind:value={newSlotDay}
							>
						{#each dayNames as name, i (i)}
							<option value={i}>{name}</option>
						{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="slot-start">Start</label>
							<input
								id="slot-start"
								type="time"
								class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
								bind:value={newSlotStart}
							/>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="slot-end">End</label>
							<input
								id="slot-end"
								type="time"
								class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
								bind:value={newSlotEnd}
							/>
						</div>
						<button
							class="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
							onclick={addSlot}
						>
							Add Slot
						</button>
					</div>

					{#if availabilitySlots.length > 0}
						<div class="mt-3 space-y-1.5">
						{#each availabilitySlots as slot (slot.id)}
							<div class="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
									<span class="text-sm text-gray-700 dark:text-gray-300">
										{dayNames[slot.dayOfWeek]} · {slot.startTime} – {slot.endTime}
									</span>
									<button
										class="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
										onclick={() => removeSlot(slot.id)}
									>
										Remove
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">No availability slots configured.</p>
					{/if}
				</div>
			</div>
		{/if}
	</PageContainer>
{/if}
