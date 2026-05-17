import { browser } from '$app/environment';

export interface DraftKey {
	subjectRef: string;
	questionnaireId: string;
	versionId: string;
}

function getDraftKey({ subjectRef, questionnaireId, versionId }: DraftKey): string {
	return `draft|${subjectRef}|Questionnaire/${questionnaireId}|${versionId}`;
}

export function saveDraft(key: DraftKey, data: unknown): void {
	if (!browser) return;
	localStorage.setItem(getDraftKey(key), JSON.stringify(data));
}

export function loadDraft(key: DraftKey): unknown | undefined {
	if (!browser) return undefined;
	const raw = localStorage.getItem(getDraftKey(key));
	return raw ? JSON.parse(raw) : undefined;
}

export function clearDraft(key: DraftKey): void {
	if (!browser) return;
	localStorage.removeItem(getDraftKey(key));
}

export function createDebouncedDraftSaver(delay: number = 500) {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (key: DraftKey, data: unknown) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			saveDraft(key, data);
		}, delay);
	};
}
