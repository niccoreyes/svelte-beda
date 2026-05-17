import { generatePatientSummary as aiGeneratePatientSummary } from './service';
import type { PatientSummaryResult } from './service';

export { type PatientSummaryResult };

export async function generatePatientSummary(patientId: string): Promise<PatientSummaryResult> {
	return aiGeneratePatientSummary(patientId);
}
