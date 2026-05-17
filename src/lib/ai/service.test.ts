import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AI Service', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.stubEnv('VITE_AI_SERVICE_URL', '');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it('generatePatientSummary returns mock data when AI service is not configured', async () => {
		const { generatePatientSummary } = await import('./service');
		const result = await generatePatientSummary('patient-123');
		expect(result.summary).toContain('patient-123');
		expect(result.highlights).toBeInstanceOf(Array);
	});

	it('transcribeEncounter returns mock data when AI service is not configured', async () => {
		const { transcribeEncounter } = await import('./service');
		const blob = new Blob(['audio'], { type: 'audio/webm' });
		const result = await transcribeEncounter('encounter-456', blob);
		expect(result.transcript).toBeTruthy();
		expect(typeof result.duration).toBe('number');
	});

	it('generateQuestionnaireFromText returns mock data when AI service is not configured', async () => {
		const { generateQuestionnaireFromText } = await import('./service');
		const result = await generateQuestionnaireFromText('Create a diabetes questionnaire');
		expect(result.questionnaire.resourceType).toBe('Questionnaire');
		expect(result.questionnaire.item).toBeInstanceOf(Array);
	});

	it('generateQuestionnaireFromPDF returns mock data when AI service is not configured', async () => {
		const { generateQuestionnaireFromPDF } = await import('./service');
		const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
		const result = await generateQuestionnaireFromPDF(file);
		expect(result.questionnaire.resourceType).toBe('Questionnaire');
	});

	it('calls real AI service when VITE_AI_SERVICE_URL is set', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ summary: 'Real summary', highlights: ['A', 'B'] })
		});
		globalThis.fetch = mockFetch;
		vi.stubEnv('VITE_AI_SERVICE_URL', 'https://ai.example.com');

		const { generatePatientSummary } = await import('./service');
		const result = await generatePatientSummary('patient-789');
		expect(mockFetch).toHaveBeenCalledWith(
			'https://ai.example.com/generate-patient-summary',
			expect.objectContaining({ method: 'POST' })
		);
		expect(result.summary).toBe('Real summary');
	});

	it('throws on HTTP error from AI service', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: async () => 'Server error'
		});
		globalThis.fetch = mockFetch;
		vi.stubEnv('VITE_AI_SERVICE_URL', 'https://ai.example.com');

		const { generatePatientSummary } = await import('./service');
		await expect(generatePatientSummary('patient-000')).rejects.toThrow('AI service error: 500');
	});
});
