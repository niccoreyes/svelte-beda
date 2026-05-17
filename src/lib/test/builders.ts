import type {
	Patient,
	Practitioner,
	PractitionerRole,
	Encounter,
	Consent,
	HealthcareService,
	CodeSystem,
	ValueSet
} from 'fhir/r4b';

export function buildPatient(overrides?: Partial<Patient>): Patient {
	return {
		resourceType: 'Patient',
		id: 'patient-1',
		name: [{ given: ['John'], family: 'Doe' }],
		gender: 'male',
		birthDate: '1980-01-01',
		...overrides
	};
}

export function buildPractitioner(overrides?: Partial<Practitioner>): Practitioner {
	return {
		resourceType: 'Practitioner',
		id: 'practitioner-1',
		name: [{ given: ['Jane'], family: 'Smith' }],
		...overrides
	};
}

export function buildPractitionerRole(overrides?: Partial<PractitionerRole>): PractitionerRole {
	return {
		resourceType: 'PractitionerRole',
		id: 'practitioner-role-1',
		practitioner: { reference: 'Practitioner/practitioner-1' },
		code: [{ coding: [{ system: 'http://snomed.info/sct', code: '36682004', display: 'Physician' }] }],
		...overrides
	};
}

export function buildEncounter(overrides?: Partial<Encounter>): Encounter {
	return {
		resourceType: 'Encounter',
		id: 'encounter-1',
		status: 'finished',
		class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
		subject: { reference: 'Patient/patient-1' },
		period: { start: '2024-01-01T09:00:00Z', end: '2024-01-01T10:00:00Z' },
		...overrides
	};
}

export function buildConsent(overrides?: Partial<Consent>): Consent {
	return {
		resourceType: 'Consent',
		id: 'consent-1',
		status: 'active',
		scope: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/consentscope', code: 'patient-privacy', display: 'Privacy Consent' }] },
		category: [{ coding: [{ system: 'http://loinc.org', code: '59284-0', display: 'Consent Document' }] }],
		patient: { reference: 'Patient/patient-1' },
		dateTime: '2024-01-01',
		...overrides
	};
}

export function buildHealthcareService(overrides?: Partial<HealthcareService>): HealthcareService {
	return {
		resourceType: 'HealthcareService',
		id: 'healthcare-service-1',
		active: true,
		name: 'General Medicine',
		type: [{ coding: [{ system: 'http://snomed.info/sct', code: '394609007', display: 'General medicine' }] }],
		...overrides
	};
}

export function buildCodeSystem(overrides?: Partial<CodeSystem>): CodeSystem {
	return {
		resourceType: 'CodeSystem',
		id: 'code-system-1',
		status: 'active',
		content: 'complete',
		name: 'TestCodeSystem',
		title: 'Test Code System',
		url: 'http://example.org/fhir/CodeSystem/test',
		concept: [{ code: 'code-1', display: 'Code One' }],
		...overrides
	};
}

export function buildValueSet(overrides?: Partial<ValueSet>): ValueSet {
	return {
		resourceType: 'ValueSet',
		id: 'value-set-1',
		status: 'active',
		name: 'TestValueSet',
		title: 'Test Value Set',
		url: 'http://example.org/fhir/ValueSet/test',
		compose: {
			include: [{ system: 'http://example.org/fhir/CodeSystem/test' }]
		},
		...overrides
	};
}
