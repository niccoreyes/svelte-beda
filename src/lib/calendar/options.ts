import type { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function getCssVar(name: string, fallback: string): string {
	if (typeof document === 'undefined') return fallback;
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function getCalendarOptions(overrides?: Partial<CalendarOptions>): CalendarOptions {
	const primaryColor = getCssVar('--bcp-6', '#3366ff');

	return {
		plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
		initialView: 'timeGridWeek',
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		editable: true,
		selectable: true,
		selectMirror: true,
		dayMaxEvents: true,
		weekends: true,
		allDaySlot: false,
		slotMinTime: '07:00:00',
		slotMaxTime: '20:00:00',
		slotDuration: '00:30:00',
		eventTimeFormat: {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		},
		eventDisplay: 'block',
		eventColor: primaryColor,
		eventTextColor: '#ffffff',
		eventBorderColor: primaryColor,
		eventBackgroundColor: primaryColor,
		buttonText: {
			today: 'Today',
			month: 'Month',
			week: 'Week',
			day: 'Day'
		},
		buttonIcons: {
			prev: 'chevron-left',
			next: 'chevron-right'
		},
		views: {
			dayGridMonth: {
				titleFormat: { year: 'numeric', month: 'long' }
			},
			timeGridWeek: {
				titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
			},
			timeGridDay: {
				titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
			}
		},
		eventClassNames: 'rounded-md text-sm font-medium shadow-sm',
		dayCellClassNames: 'bg-white dark:bg-gray-800',
		dayHeaderClassNames: 'text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase',
		slotLabelClassNames: 'text-gray-500 dark:text-gray-400 text-xs',
		nowIndicatorClassNames: 'border-red-500',
		...overrides
	};
}

export const defaultCalendarOptions: CalendarOptions = getCalendarOptions();
