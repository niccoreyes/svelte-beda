import { format, addMinutes, isBefore, isAfter, isEqual, parseISO } from 'date-fns';

export interface TimeSlot {
	start: Date;
	end: Date;
}

export interface AppointmentSlot {
	start: string;
	end: string;
}

export function isSlotAvailable(slot: TimeSlot, appointments: AppointmentSlot[]): boolean {
	return !appointments.some((app) => {
		const appStart = parseISO(app.start);
		const appEnd = parseISO(app.end);
		return (
			isEqual(slot.start, appStart) ||
			isEqual(slot.end, appEnd) ||
			(isAfter(slot.start, appStart) && isBefore(slot.start, appEnd)) ||
			(isAfter(slot.end, appStart) && isBefore(slot.end, appEnd)) ||
			(isBefore(slot.start, appStart) && isAfter(slot.end, appEnd))
		);
	});
}

export function generateTimeSlots(
	start: Date,
	end: Date,
	durationMinutes: number
): TimeSlot[] {
	const slots: TimeSlot[] = [];
	let current = new Date(start);

	while (isBefore(current, end) || isEqual(current, end)) {
		const slotEnd = addMinutes(current, durationMinutes);
		if (isAfter(slotEnd, end)) break;
		slots.push({ start: new Date(current), end: new Date(slotEnd) });
		current = slotEnd;
	}

	return slots;
}

export function formatSlot(slot: TimeSlot): string {
	return `${format(slot.start, 'yyyy-MM-dd HH:mm')} - ${format(slot.end, 'HH:mm')}`;
}

export function getDayBounds(date: Date): { start: Date; end: Date } {
	const start = new Date(date);
	start.setHours(7, 0, 0, 0);
	const end = new Date(date);
	end.setHours(20, 0, 0, 0);
	return { start, end };
}
