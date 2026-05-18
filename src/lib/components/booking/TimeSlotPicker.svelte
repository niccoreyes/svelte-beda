<script lang="ts">
	import type { Practitioner, Appointment } from 'fhir/r4b';
	import { getAllFHIRResources } from '$lib/fhir/client';
	import { createServiceState } from '$lib/state';
	import { generateTimeSlots, getDayBounds, isSlotAvailable, type TimeSlot } from '$lib/calendar/availability';
	import { format, addDays, startOfDay } from 'date-fns';
	import Spinner from '$lib/components/Spinner.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		practitioner: Practitioner;
		selectedSlot?: TimeSlot | null;
		onSelect: (slot: TimeSlot) => void;
	}

	let { practitioner, selectedSlot, onSelect }: Props = $props();

	let selectedDayIndex = $state(0);
	const daysToShow = 7;

	const today = startOfDay(new Date());
	const days = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

	const appointmentsState = createServiceState<Appointment[]>(async () => {
		return getAllFHIRResources<Appointment>('Appointment', {
			practitioner: `Practitioner/${practitioner.id}`,
			status: 'booked,arrived,pending,proposed',
			_count: 100
		});
	});

	$effect(() => {
		appointmentsState.reload();
	});

	const slotsByDay = $derived(() => {
		if (appointmentsState.data.status !== 'success') return [];
		const appointments = appointmentsState.data.data;
		const appSlots = appointments
			.filter((a) => a.start && a.end)
			.map((a) => ({ start: a.start!, end: a.end! }));

		return days.map((day) => {
			const { start, end } = getDayBounds(day);
			const allSlots = generateTimeSlots(start, end, 30);
			const available = allSlots.filter((slot) => isSlotAvailable(slot, appSlots));
			return { day, slots: available };
		});
	});
</script>

<div class="space-y-4">
	<div class="flex gap-2 overflow-x-auto pb-2">
		{#each days as day, i (i)}
			<button
				onclick={() => (selectedDayIndex = i)}
				class="flex-shrink-0 px-4 py-2 rounded-lg border text-sm transition-colors {selectedDayIndex === i ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-medium' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}"
			>
				<div class="text-xs uppercase">{format(day, 'EEE')}</div>
				<div class="text-lg font-semibold">{format(day, 'd')}</div>
				<div class="text-xs">{format(day, 'MMM')}</div>
			</button>
		{/each}
	</div>

	{#if appointmentsState.data.status === 'loading'}
		<div class="flex items-center justify-center h-32">
			<Spinner />
		</div>
	{:else if appointmentsState.data.status === 'failure'}
		<div class="p-4 text-error text-sm">
			Error loading availability: {appointmentsState.data.error?.message || 'Unknown error'}
		</div>
	{:else if appointmentsState.data.status === 'success'}
		{@const dayData = slotsByDay()[selectedDayIndex]}
		{#if dayData && dayData.slots.length > 0}
			<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
				{#each dayData.slots as slot (slot.start.getTime())}
					<button
						onclick={() => onSelect(slot)}
						class="px-3 py-2 text-sm rounded-lg border transition-colors {selectedSlot && selectedSlot.start.getTime() === slot.start.getTime() ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'}"
					>
						{format(slot.start, 'h:mm a')}
					</button>
				{/each}
			</div>
		{:else}
			<Empty message="No available slots for this day" />
		{/if}
	{/if}
</div>
