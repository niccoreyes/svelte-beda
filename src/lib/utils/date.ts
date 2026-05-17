export function humanDate(dateString?: string): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function humanDateTime(dateString?: string): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatPeriodDateTime(period?: { start?: string; end?: string }): string {
	if (!period?.start) return '-';
	const startDate = humanDateTime(period.start);
	const endTime = period.end ? new Date(period.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;
	return endTime ? `${startDate} – ${endTime}` : startDate;
}

export function humanTime(dateString?: string): string {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function formatPartialDate(dateString?: string): string {
	if (!dateString) return '';
	if (/^\d{4}$/.test(dateString)) return dateString;
	if (/^\d{4}-\d{2}$/.test(dateString)) {
		const [year, month] = dateString.split('-');
		return new Date(`${year}-${month}-01`).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
	}
	return humanDate(dateString);
}
