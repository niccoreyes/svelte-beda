<script lang="ts">
	import type { Appointment } from 'fhir/r4b';
	import { format, parseISO, addDays, startOfWeek, isSameDay, getHours, getMinutes } from 'date-fns';

	export interface AvailabilitySlot {
		id: string;
		dayOfWeek: number; // 0-6 (Sun-Sat)
		startTime: string; // HH:mm
		endTime: string; // HH:mm
	}

	interface Props {
		practitionerId: string;
		appointments?: Appointment[];
		availabilitySlots?: AvailabilitySlot[];
	}

	let { appointments = [], availabilitySlots = [] }: Props = $props();

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let currentWeekStart = $state(startOfWeek(new Date(), { weekStartsOn: 1 }));

	const weekDates = $derived(
		Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
	);

	function getSlotsForDay(dayIndex: number): AvailabilitySlot[] {
		return availabilitySlots.filter((s) => s.dayOfWeek === dayIndex);
	}

	function getAppointmentsForDay(date: Date): Appointment[] {
		return appointments.filter((app) => {
			if (!app.start) return false;
			return isSameDay(parseISO(app.start), date);
		});
	}

	function isTimeInSlot(timeStr: string, slot: AvailabilitySlot): boolean {
		const [h = 0, m = 0] = timeStr.split(':').map(Number);
		const [sh = 0, sm = 0] = slot.startTime.split(':').map(Number);
		const [eh = 0, em = 0] = slot.endTime.split(':').map(Number);
		const time = h * 60 + m;
		const start = sh * 60 + sm;
		const end = eh * 60 + em;
		return time >= start && time < end;
	}

	function getAppointmentTimeBlocks(app: Appointment): { start: string; end: string } | null {
		if (!app.start || !app.end) return null;
		const s = parseISO(app.start);
		const e = parseISO(app.end);
		return {
			start: `${String(getHours(s)).padStart(2, '0')}:${String(getMinutes(s)).padStart(2, '0')}`,
			end: `${String(getHours(e)).padStart(2, '0')}:${String(getMinutes(e)).padStart(2, '0')}`
		};
	}

	const timeLabels = [
		'07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
		'13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
	];

	function previousWeek() {
		currentWeekStart = addDays(currentWeekStart, -7);
	}

	function nextWeek() {
		currentWeekStart = addDays(currentWeekStart, 7);
	}

	function getSlotStatus(dayIndex: number, timeLabel: string): 'available' | 'busy' | 'unavailable' {
		const daySlots = getSlotsForDay(dayIndex);
		const isAvailable = daySlots.some((s) => isTimeInSlot(timeLabel, s));

		// Check if there's an appointment at this time on this day
		const dayDate = weekDates[dayIndex];
		if (!dayDate) return 'unavailable';
		const dayApps = getAppointmentsForDay(dayDate);
		const isBusy = dayApps.some((app) => {
			const blocks = getAppointmentTimeBlocks(app);
			if (!blocks) return false;
			const [h = 0] = timeLabel.split(':').map(Number);
			const [sh = 0] = blocks.start.split(':').map(Number);
			const [eh = 0] = blocks.end.split(':').map(Number);
			return h >= sh && h < eh;
		});

		if (isBusy) return 'busy';
		if (isAvailable) return 'available';
		return 'unavailable';
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<button
			class="px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			onclick={previousWeek}
		>
			← Previous
		</button>
		<h3 class="text-sm font-semibold text-gray-900 dark:text-white">
			Week of {format(currentWeekStart, 'MMM d, yyyy')}
		</h3>
		<button
			class="px-2 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			onclick={nextWeek}
		>
			Next →
		</button>
	</div>

	<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
		<table class="min-w-full text-xs">
			<thead>
				<tr>
					<th class="px-2 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky left-0 z-10"></th>
					{#each weekDates as date, i (i)}
						<th class="px-2 py-2 text-center font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 {isSameDay(date, new Date()) ? 'bg-primary/10' : 'bg-gray-50 dark:bg-gray-800'}" style="min-width: 100px;">
							<div>{weekDays[i]}</div>
							<div class="text-gray-500">{format(date, 'MMM d')}</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each timeLabels as time (time)}
					<tr class="border-b border-gray-100 dark:border-gray-800">
						<td class="px-2 py-1.5 text-gray-500 dark:text-gray-400 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-100 dark:border-gray-800">
							{time}
						</td>
						{#each Array.from({ length: 7 }, (_, i) => i) as dayIndex (dayIndex)}
							{@const status = getSlotStatus(dayIndex, time)}
							<td class="px-1 py-1">
								<div
									class="h-6 rounded-sm {status === 'available' ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700' : status === 'busy' ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700' : 'bg-gray-50 dark:bg-gray-800/50 border border-transparent'}"
									title={status === 'available' ? 'Available' : status === 'busy' ? 'Busy' : 'Unavailable'}
								></div>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
		<div class="flex items-center gap-1.5">
			<div class="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700"></div>
			<span>Available</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div class="w-3 h-3 rounded-sm bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700"></div>
			<span>Busy</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div class="w-3 h-3 rounded-sm bg-gray-50 border border-transparent dark:bg-gray-800/50"></div>
			<span>Unavailable</span>
		</div>
	</div>
</div>
