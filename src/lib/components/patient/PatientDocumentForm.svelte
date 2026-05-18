<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
	import { getCurrentUser } from '$lib/auth';
	import { debounce } from '$lib/utils';
	import QuestionnaireResponseForm from '$lib/forms/QuestionnaireResponseForm.svelte';

	interface Props {
		questionnaire: Questionnaire;
		patientId: string;
		initialResponse?: Partial<QuestionnaireResponse>;
		onSaved?: (response: QuestionnaireResponse) => void;
	}

	let { questionnaire, patientId, initialResponse, onSaved }: Props = $props();

	const subjectRef = $derived(`Patient/${patientId}`);
	const user = getCurrentUser();
	const authorRef = $derived(user?.sub ? `Practitioner/${user.sub}` : undefined);

	const draftKey = $derived(`patient-doc-${patientId}-${questionnaire.id}`);

	function saveDraftLocal(data: Partial<QuestionnaireResponse>) {
		try {
			localStorage.setItem(draftKey, JSON.stringify(data));
		} catch {
			// ignore storage errors
		}
	}

	function loadDraftLocal(): Partial<QuestionnaireResponse> | null {
		try {
			const raw = localStorage.getItem(draftKey);
			if (raw) return JSON.parse(raw) as Partial<QuestionnaireResponse>;
		} catch {
			// ignore parse errors
		}
		return null;
	}

	function clearDraftLocal() {
		try {
			localStorage.removeItem(draftKey);
		} catch {
			// ignore
		}
	}

	const debouncedSave = debounce((data: Partial<QuestionnaireResponse>) => {
		saveDraftLocal(data);
	}, 500);

	const mergedInitial = $derived(() => {
		const draft = loadDraftLocal();
		if (draft) {
			return { ...initialResponse, ...draft };
		}
		return initialResponse;
	});

	function handleSubmit(response: QuestionnaireResponse) {
		clearDraftLocal();
		onSaved?.(response);
	}

	function handleSaveDraft(response: Partial<QuestionnaireResponse>) {
		debouncedSave(response);
	}
</script>

<QuestionnaireResponseForm
	{questionnaire}
	initialResponse={mergedInitial()}
	{subjectRef}
	{authorRef}
	saveService="provenance"
	onSubmit={handleSubmit}
	onSaveDraft={handleSaveDraft}
/>
