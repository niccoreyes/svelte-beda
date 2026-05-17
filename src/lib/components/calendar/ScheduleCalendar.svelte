<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import type { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import interactionPlugin from '@fullcalendar/interaction';
	import type { Appointment } from 'fhir/r4b';
	import { getCalendarOptions } from '$lib/calendar/options';

	interface Props {
		appointments?: Appointment[];
		onEventClick?: (appointment: Appointment) => void;
		onDateSelect?: (start: Date, end: Date) => void;
		initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
	}

	let {
		appointments = [],
		onEventClick,
		onDateSelect,
		initialView = 'timeGridWeek'
	}: Props = $props();

	let calendarEl: HTMLDivElement;
	let calendar: Calendar | null = null;

	function appointmentToEvent(app: Appointment): EventInput {
		const patient = app.participant?.find((p) => p.actor?.reference?.startsWith('Patient/'));
		const practitioner = app.participant?.find((p) => p.actor?.reference?.startsWith('Practitioner/'));
		const title =
			app.description ||
			app.serviceType?.[0]?.text ||
			[patient?.actor?.display, practitioner?.actor?.display].filter(Boolean).join(' — ') ||
			'Appointment';

		return {
			id: app.id || undefined,
			title,
			start: app.start || undefined,
			end: app.end || undefined,
			extendedProps: { appointment: app }
		};
	}

	const events = $derived(appointments.map(appointmentToEvent));

	function createCalendar() {
		if (!calendarEl) return;
		if (calendar) {
			calendar.destroy();
			calendar = null;
		}

		const options = getCalendarOptions({
			initialView,
			plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
			events,
			eventClick: (info: EventClickArg) => {
				const app = info.event.extendedProps?.appointment as Appointment | undefined;
				if (app) onEventClick?.(app);
			},
			select: (info: DateSelectArg) => {
				onDateSelect?.(info.start, info.end);
			},
			selectable: true,
			editable: true,
			selectMirror: true,
			dayMaxEvents: true,
			weekends: true,
			allDaySlot: false,
			slotMinTime: '07:00:00',
			slotMaxTime: '20:00:00',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,timeGridDay'
			},
			height: 'auto'
		});

		calendar = new Calendar(calendarEl, options);
		calendar.render();
	}

	$effect(() => {
		if (calendarEl && !calendar) {
			createCalendar();
		}
		return () => {
			calendar?.destroy();
			calendar = null;
		};
	});

	$effect(() => {
		if (calendar) {
			calendar.removeAllEventSources();
			calendar.addEventSource(events);
		}
	});
</script>

<div bind:this={calendarEl} class="schedule-calendar"></div>

<style>
	.schedule-calendar :global(.fc) {
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
	}

	.schedule-calendar :global(.fc-toolbar-title) {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--gray-10);
	}

	.schedule-calendar :global(.fc-button) {
		background-color: var(--bcp-6);
		border-color: var(--bcp-6);
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375rem;
		box-shadow: none;
	}

	.schedule-calendar :global(.fc-button:hover) {
		background-color: var(--bcp-7);
		border-color: var(--bcp-7);
	}

	.schedule-calendar :global(.fc-button:active) {
		background-color: var(--bcp-8);
		border-color: var(--bcp-8);
	}

	.schedule-calendar :global(.fc-button:focus) {
		box-shadow: 0 0 0 2px var(--bcp-3);
	}

	.schedule-calendar :global(.fc-button.fc-button-active) {
		background-color: var(--bcp-8);
		border-color: var(--bcp-8);
	}

	.schedule-calendar :global(.fc-event) {
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border: none;
		cursor: pointer;
	}

	.schedule-calendar :global(.fc-event:hover) {
		opacity: 0.9;
	}

	.schedule-calendar :global(.fc-day-today) {
		background-color: var(--bcp-1) !important;
	}

	.schedule-calendar :global(.fc-timegrid-slot) {
		height: 3rem;
	}

	.schedule-calendar :global(.fc-col-header-cell) {
		padding: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-7);
		background-color: var(--gray-2);
	}

	.schedule-calendar :global(.fc-timegrid-axis) {
		color: var(--gray-6);
		font-size: 0.75rem;
	}

	.schedule-calendar :global(.fc-timegrid-now-indicator-line) {
		border-color: #ef4444;
		border-width: 2px;
	}

	.schedule-calendar :global(.fc-timegrid-now-indicator-arrow) {
		color: #ef4444;
	}

	.schedule-calendar :global(.fc-col-header-cell) {
		background-color: var(--gray-2);
	}

	.schedule-calendar :global(.fc-daygrid-day-number) {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--gray-9);
		padding: 0.5rem;
	}

	.schedule-calendar :global(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
		color: var(--bcp-6);
		font-weight: 700;
	}

	.schedule-calendar :global(.fc-more-link) {
		color: var(--bcp-6);
		font-weight: 500;
		font-size: 0.75rem;
	}

	:global(.dark) .schedule-calendar :global(.fc) {
		color: var(--gray-9);
	}

	:global(.dark) .schedule-calendar :global(.fc-toolbar-title) {
		color: var(--gray-10);
	}

	:global(.dark) .schedule-calendar :global(.fc-col-header-cell) {
		background-color: var(--gray-3);
		color: var(--gray-6);
	}

	:global(.dark) .schedule-calendar :global(.fc-daygrid-day) {
		background-color: var(--theme-sidebar-background);
	}

	:global(.dark) .schedule-calendar :global(.fc-daygrid-day-number) {
		color: var(--gray-9);
	}

	:global(.dark) .schedule-calendar :global(.fc-timegrid-slot-label-cushion) {
		color: var(--gray-6);
	}

	:global(.dark) .schedule-calendar :global(.fc-timegrid-slot) {
		background-color: var(--theme-sidebar-background);
	}
</style>
