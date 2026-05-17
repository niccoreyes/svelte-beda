<script lang="ts">
	import type { Appointment } from 'fhir/r4';

	interface Props {
		appointments?: Appointment[];
	}

	let { appointments = [] }: Props = $props();

	let currentDate = $state(new Date());

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const year = $derived(currentDate.getFullYear());
	const month = $derived(currentDate.getMonth());

	const firstDayOfMonth = $derived(new Date(year, month, 1));
	const daysInMonth = $derived(new Date(year, month + 1, 0).getDate());
	const startDay = $derived(firstDayOfMonth.getDay());

	const days = $derived(() => {
		const result: { day: number; appointments: Appointment[] }[] = [];
		for (let i = 0; i < startDay; i++) {
			result.push({ day: 0, appointments: [] });
		}
		for (let d = 1; d <= daysInMonth; d++) {
			const dayApps = appointments.filter((app) => {
				if (!app.start) return false;
				const date = new Date(app.start);
				return date.getFullYear() === year && date.getMonth() === month && date.getDate() === d;
			});
			result.push({ day: d, appointments: dayApps });
		}
		return result;
	});

	function prevMonth() {
		currentDate = new Date(year, month - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(year, month + 1, 1);
	}

	function getAppointmentTitle(app: Appointment): string {
		return (
			app.description ||
			app.appointmentType?.text ||
			app.serviceType?.[0]?.text ||
			app.participant?.map((p) => p.actor?.display).filter(Boolean).join(', ') ||
			'Appointment'
		);
	}

	function isToday(day: number): boolean {
		const today = new Date();
		return (
			today.getDate() === day &&
			today.getMonth() === month &&
			today.getFullYear() === year
		);
	}
</script>

<div class="calendar">
	<div class="calendar-header">
		<button class="nav-btn" onclick={prevMonth} aria-label="Previous month">&#8249;</button>
		<h2 class="month-title">{monthNames[month]} {year}</h2>
		<button class="nav-btn" onclick={nextMonth} aria-label="Next month">&#8250;</button>
	</div>

	<div class="weekdays">
		{#each weekDays as wd}
			<div class="weekday">{wd}</div>
		{/each}
	</div>

	<div class="days-grid">
		{#each days() as { day, appointments: dayApps }}
			<div class="day-cell" class:empty={day === 0} class:today={isToday(day)}>
				{#if day > 0}
					<div class="day-number">{day}</div>
					<div class="appointments">
						{#each dayApps as app}
							<div class="appointment-badge" title={getAppointmentTitle(app)}>
								{getAppointmentTitle(app)}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.calendar {
		background-color: var(--theme-sidebar-background);
		border-radius: 10px;
		border: 1px solid var(--gray-4);
		padding: 16px;
		box-shadow:
			0 1px 2px 0 rgba(0, 0, 0, 0.03),
			0 1px 6px -1px rgba(0, 0, 0, 0.02),
			0 2px 4px 0 rgba(0, 0, 0, 0.02);
	}

	:global(.dark) .calendar {
		border-color: var(--gray-4);
		box-shadow:
			0 1px 2px 0 rgba(0, 0, 0, 0.1),
			0 1px 6px -1px rgba(0, 0, 0, 0.08),
			0 2px 4px 0 rgba(0, 0, 0, 0.08);
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.month-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
	}

	:global(.dark) .month-title {
		color: var(--gray-10);
	}

	.nav-btn {
		background: transparent;
		border: 1px solid var(--gray-4);
		border-radius: 6px;
		width: 28px;
		height: 28px;
		cursor: pointer;
		color: var(--gray-8);
		font-size: 18px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 2px;
	}

	.nav-btn:hover {
		background-color: var(--gray-3);
		border-color: var(--gray-5);
	}

	.weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		margin-bottom: 4px;
	}

	.weekday {
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		color: var(--gray-7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 4px 0;
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
	}

	.day-cell {
		min-height: 80px;
		border: 1px solid var(--gray-4);
		border-radius: 6px;
		padding: 6px;
		background-color: var(--theme-sidebar-background);
		transition: background-color 0.15s ease;
	}

	.day-cell.empty {
		background-color: transparent;
		border-color: transparent;
	}

	.day-cell:not(.empty):hover {
		background-color: var(--gray-2);
	}

	.day-cell.today {
		border-color: var(--bcp-6);
		background-color: var(--bcp-1);
	}

	:global(.dark) .day-cell.today {
		background-color: var(--bcp-1);
	}

	.day-number {
		font-size: 12px;
		font-weight: 600;
		color: var(--gray-9);
		margin-bottom: 4px;
	}

	.today .day-number {
		color: var(--bcp-6);
	}

	.appointments {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.appointment-badge {
		font-size: 10px;
		font-weight: 500;
		padding: 2px 4px;
		border-radius: 4px;
		background-color: var(--bcp-1);
		color: var(--bcp-8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: default;
	}

	:global(.dark) .appointment-badge {
		background-color: var(--bcp-1);
		color: var(--bcp-8);
	}
</style>
