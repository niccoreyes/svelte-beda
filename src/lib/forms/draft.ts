import { debounce } from '$lib/utils/debounce';
import type { QuestionnaireResponse } from 'fhir/r4b';
import { saveFHIRResource } from '$lib/fhir/client';

export type DraftServiceType = 'local' | 'server';

export interface DraftConfig {
	serviceType: DraftServiceType;
	questionnaireId: string;
	versionId: string;
	subjectRef: string;
	debounceMs?: number;
}

function getDraftKey(config: DraftConfig): string {
	return `draft|${config.subjectRef}|Questionnaire/${config.questionnaireId}|${config.versionId}`;
}

export function loadDraft(config: DraftConfig): Partial<QuestionnaireResponse> | null {
	if (config.serviceType !== 'local') return null;
	try {
		const key = getDraftKey(config);
		const raw = localStorage.getItem(key);
		if (raw) {
			return JSON.parse(raw) as Partial<QuestionnaireResponse>;
		}
	} catch {
		// ignore parse errors
	}
	return null;
}

export function saveDraft(config: DraftConfig, response: Partial<QuestionnaireResponse>): void {
	if (config.serviceType !== 'local') return;
	try {
		const key = getDraftKey(config);
		localStorage.setItem(key, JSON.stringify(response));
	} catch {
		// ignore storage errors (e.g. quota exceeded)
	}
}

export function clearDraft(config: DraftConfig): void {
	if (config.serviceType !== 'local') return;
	try {
		const key = getDraftKey(config);
		localStorage.removeItem(key);
	} catch {
		// ignore
	}
}

export function createAutoSave(
	config: DraftConfig,
	onSave: (response: Partial<QuestionnaireResponse>) => void,
	onError?: (err: Error) => void
) {
	const debouncedSave = debounce((response: Partial<QuestionnaireResponse>) => {
		try {
			saveDraft(config, response);
			onSave(response);
		} catch (err) {
			onError?.(err instanceof Error ? err : new Error(String(err)));
		}
	}, config.debounceMs ?? 500);

	return {
		save: (response: Partial<QuestionnaireResponse>) => debouncedSave(response),
		flush: () => debouncedSave.flush?.()
	};
}

export async function saveServerDraft(response: Partial<QuestionnaireResponse>): Promise<void> {
	const draft: QuestionnaireResponse = {
		...response,
		resourceType: 'QuestionnaireResponse',
		status: 'in-progress'
	} as QuestionnaireResponse;
	await saveFHIRResource(draft);
}
