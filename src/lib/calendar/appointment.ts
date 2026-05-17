import type { Appointment } from 'fhir/r4b';
import {
	createFHIRResource,
	updateFHIRResource,
	deleteFHIRResource,
	getFHIRResources,
	findFHIRResource
} from '$lib/fhir/client';

export interface AppointmentInput {
	status?: Appointment['status'];
	start?: string;
	end?: string;
	serviceType?: Appointment['serviceType'];
	appointmentType?: Appointment['appointmentType'];
	specialty?: Appointment['specialty'];
	participant?: Appointment['participant'];
	description?: string;
	comment?: string;
	reasonCode?: Appointment['reasonCode'];
	created?: string;
}

export async function createAppointment(data: AppointmentInput): Promise<Appointment> {
	const resource: Appointment = {
		resourceType: 'Appointment',
		status: data.status || 'proposed',
		participant: data.participant || [],
		...(data.start && { start: data.start }),
		...(data.end && { end: data.end }),
		...(data.serviceType && { serviceType: data.serviceType }),
		...(data.appointmentType && { appointmentType: data.appointmentType }),
		...(data.specialty && { specialty: data.specialty }),
		...(data.description && { description: data.description }),
		...(data.comment && { comment: data.comment }),
		...(data.reasonCode && { reasonCode: data.reasonCode }),
		...(data.created && { created: data.created })
	};
	return createFHIRResource<Appointment>(resource);
}

export async function updateAppointment(id: string, data: AppointmentInput): Promise<Appointment> {
	const resource: Appointment = {
		resourceType: 'Appointment',
		id,
		status: data.status || 'proposed',
		participant: data.participant || [],
		...(data.start && { start: data.start }),
		...(data.end && { end: data.end }),
		...(data.serviceType && { serviceType: data.serviceType }),
		...(data.appointmentType && { appointmentType: data.appointmentType }),
		...(data.specialty && { specialty: data.specialty }),
		...(data.description && { description: data.description }),
		...(data.comment && { comment: data.comment }),
		...(data.reasonCode && { reasonCode: data.reasonCode }),
		...(data.created && { created: data.created })
	};
	return updateFHIRResource<Appointment>(resource);
}

export async function deleteAppointment(id: string): Promise<void> {
	const resource: Appointment = {
		resourceType: 'Appointment',
		id,
		status: 'cancelled',
		participant: []
	};
	return deleteFHIRResource(resource);
}

export async function searchAppointments(params: {
	patient?: string;
	practitioner?: string;
	date?: string;
	status?: string | string[];
	_serviceType?: string;
	_count?: number;
}): Promise<Appointment[]> {
	const searchParams: Record<string, string | string[] | number | undefined> = {};
	if (params.patient) searchParams.patient = params.patient;
	if (params.practitioner) searchParams.practitioner = params.practitioner;
	if (params.date) searchParams.date = params.date;
	if (params.status) searchParams.status = params.status;
	if (params._serviceType) searchParams._serviceType = params._serviceType;
	if (params._count) searchParams._count = params._count;

	const bundle = await getFHIRResources('Appointment', searchParams);
	return (bundle.entry?.map((e) => e.resource as Appointment).filter(Boolean) as Appointment[]) || [];
}

export async function getAppointment(id: string): Promise<Appointment | undefined> {
	return findFHIRResource<Appointment>('Appointment', { _id: id });
}
