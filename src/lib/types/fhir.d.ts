import type { Patient, Practitioner, Encounter, Appointment, Questionnaire, QuestionnaireResponse, Observation, Condition, MedicationKnowledge, Medication, MedicationRequest, Invoice, Provenance, Consent, HealthcareService, PractitionerRole, Bundle, Resource } from 'fhir/r4b';

export type {
	Patient,
	Practitioner,
	Encounter,
	Appointment,
	Questionnaire,
	QuestionnaireResponse,
	Observation,
	Condition,
	MedicationKnowledge,
	Medication,
	MedicationRequest,
	Invoice,
	Provenance,
	Consent,
	HealthcareService,
	PractitionerRole,
	Bundle,
	Resource
};

export interface FHIRReference {
	reference?: string;
	type?: string;
	display?: string;
}

export interface RemoteData<D, E = Error> {
	status: 'notAsked' | 'loading' | 'success' | 'failure';
	data?: D;
	error?: E;
}
