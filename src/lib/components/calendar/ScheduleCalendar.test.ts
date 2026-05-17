import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import ScheduleCalendar from './ScheduleCalendar.svelte';
import type { Appointment } from 'fhir/r4b';

vi.mock('@fullcalendar/core', () => ({
	Calendar: class MockCalendar {
		render = vi.fn();
		destroy = vi.fn();
		removeAllEventSources = vi.fn();
		addEventSource = vi.fn();
		getEvents = vi.fn(() => []);
		constructor(_el: HTMLElement, _options: unknown) {}
	}
}));

vi.mock('@fullcalendar/daygrid', () => ({
	default: 'dayGridPlugin'
}));

vi.mock('@fullcalendar/timegrid', () => ({
	default: 'timeGridPlugin'
}));

vi.mock('@fullcalendar/interaction', () => ({
	default: 'interactionPlugin'
}));

function buildAppointment(overrides?: Partial<Appointment>): Appointment {
	return {
		resourceType: 'Appointment',
		id: 'appt-1',
		status: 'booked',
		start: '2024-06-15T09:00:00Z',
		end: '2024-06-15T10:00:00Z',
		participant: [
			{ actor: { reference: 'Patient/patient-1', display: 'John Doe' }, status: 'accepted' },
			{ actor: { reference: 'Practitioner/practitioner-1', display: 'Dr. Jane Smith' }, status: 'accepted' }
		],
		serviceType: [{ text: 'General Checkup' }],
		description: 'Annual physical',
		...overrides
	};
}

describe('ScheduleCalendar', () => {
	it('renders without errors', () => {
		const { container } = render(ScheduleCalendar, {
			props: { appointments: [] }
		});
		expect(container.querySelector('.schedule-calendar')).toBeTruthy();
	});

	it('renders with appointments', () => {
		const appointments = [buildAppointment(), buildAppointment({ id: 'appt-2', description: 'Follow-up' })];
		const { container } = render(ScheduleCalendar, {
			props: { appointments }
		});
		expect(container.querySelector('.schedule-calendar')).toBeTruthy();
	});

	it('unmounts without errors', () => {
		const { unmount, container } = render(ScheduleCalendar, {
			props: { appointments: [] }
		});
		unmount();
		expect(container.innerHTML).toBe('');
	});

	it('accepts custom initialView prop', () => {
		const { container } = render(ScheduleCalendar, {
			props: { appointments: [], initialView: 'dayGridMonth' }
		});
		expect(container.querySelector('.schedule-calendar')).toBeTruthy();
	});
});
