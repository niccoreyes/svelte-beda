import { config } from '$lib/config';
import type { Questionnaire } from 'fhir/r4b';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || config.aiAssistantServiceUrl || '';

function getHeaders(): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};
}

async function aiFetch<T>(path: string, body: unknown): Promise<T> {
	if (!AI_SERVICE_URL) {
		return mockResponse<T>(path, body);
	}
	const response = await fetch(`${AI_SERVICE_URL}${path}`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(body)
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`AI service error: ${response.status} - ${text}`);
	}
	return response.json() as Promise<T>;
}

function mockResponse<T>(path: string, body: unknown): T {
	if (path === '/generate-patient-summary') {
		const patientId = (body as { patientId: string }).patientId;
		return {
			summary: `Mock patient summary for patient ${patientId}. The patient has no known allergies and is in good health.`,
			highlights: ['No known allergies', 'Routine checkup recommended']
		} as T;
	}
	if (path === '/transcribe-encounter') {
		return {
			transcript: 'Mock transcript: Patient reports feeling well. No new symptoms.',
			duration: 120
		} as T;
	}
	if (path === '/generate-questionnaire') {
		return {
			questionnaire: createMockQuestionnaire((body as { prompt: string }).prompt)
		} as T;
	}
	if (path === '/generate-questionnaire-pdf') {
		return {
			questionnaire: createMockQuestionnaire('Generated from PDF')
		} as T;
	}
	throw new Error(`Unknown AI service path: ${path}`);
}

function createMockQuestionnaire(prompt: string): Partial<Questionnaire> {
	return {
		resourceType: 'Questionnaire',
		status: 'draft',
		title: `Generated: ${prompt.slice(0, 50)}`,
		item: [
			{
				linkId: '1',
				text: 'Do you have any symptoms?',
				type: 'boolean'
			},
			{
				linkId: '2',
				text: 'Please describe your symptoms',
				type: 'string',
				enableWhen: [{ question: '1', operator: '=', answerBoolean: true }]
			}
		]
	};
}

export interface PatientSummaryResult {
	summary: string;
	highlights: string[];
}

export interface TranscriptionResult {
	transcript: string;
	duration: number;
}

export interface QuestionnaireGenerationResult {
	questionnaire: Partial<Questionnaire>;
}

export async function generatePatientSummary(patientId: string): Promise<PatientSummaryResult> {
	return aiFetch<PatientSummaryResult>('/generate-patient-summary', { patientId });
}

export async function transcribeEncounter(
	encounterId: string,
	audioBlob: Blob
): Promise<TranscriptionResult> {
	if (!AI_SERVICE_URL) {
		return mockResponse<TranscriptionResult>('/transcribe-encounter', { encounterId });
	}
	const formData = new FormData();
	formData.append('encounterId', encounterId);
	formData.append('audio', audioBlob, 'recording.webm');
	const response = await fetch(`${AI_SERVICE_URL}/transcribe-encounter`, {
		method: 'POST',
		body: formData
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`AI service error: ${response.status} - ${text}`);
	}
	return response.json() as Promise<TranscriptionResult>;
}

export async function generateQuestionnaireFromText(prompt: string): Promise<QuestionnaireGenerationResult> {
	return aiFetch<QuestionnaireGenerationResult>('/generate-questionnaire', { prompt });
}

export async function generateQuestionnaireFromPDF(pdfFile: File): Promise<QuestionnaireGenerationResult> {
	if (!AI_SERVICE_URL) {
		return mockResponse<QuestionnaireGenerationResult>('/generate-questionnaire-pdf', {});
	}
	const formData = new FormData();
	formData.append('pdf', pdfFile);
	const response = await fetch(`${AI_SERVICE_URL}/generate-questionnaire-pdf`, {
		method: 'POST',
		body: formData
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`AI service error: ${response.status} - ${text}`);
	}
	return response.json() as Promise<QuestionnaireGenerationResult>;
}
