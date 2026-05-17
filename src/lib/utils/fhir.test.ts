import { describe, it, expect } from 'vitest';
import { getPatientName } from './fhir';

describe('fhir utils', () => {
	it('getPatientName returns full name', () => {
		const patient = {
			name: [{ given: ['John'], family: 'Doe' }]
		};
		expect(getPatientName(patient)).toBe('John Doe');
	});

	it('getPatientName handles missing name', () => {
		expect(getPatientName({})).toBe('Unknown');
	});
});
