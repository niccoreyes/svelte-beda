<script lang="ts">
	import Modal from './Modal.svelte';
	import QuestionnaireResponseForm from '$lib/forms/QuestionnaireResponseForm.svelte';
	import { getFHIRResource } from '$lib/fhir';
	import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
	import Spinner from './Spinner.svelte';

	interface Props {
		questionnaireId: string;
		open?: boolean;
		onClose?: () => void;
		onSuccess?: (response: QuestionnaireResponse) => void;
	}

	let { questionnaireId, open = false, onClose, onSuccess }: Props = $props();

	let questionnaire = $state<Questionnaire | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		if (open && questionnaireId) {
			loadQuestionnaire();
		}
	});

	async function loadQuestionnaire() {
		loading = true;
		error = null;
		questionnaire = null;
		try {
			const q = await getFHIRResource<Questionnaire>({ reference: `Questionnaire/${questionnaireId}` });
			questionnaire = q;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load questionnaire';
		} finally {
			loading = false;
		}
	}

	function handleSubmit(response: QuestionnaireResponse) {
		onSuccess?.(response);
		onClose?.();
	}
</script>

<Modal {open} title={questionnaire?.title || 'Create Resource'} onClose={onClose}>
	{#if loading}
		<div class="flex justify-center p-8">
			<Spinner />
		</div>
	{:else if error}
		<div class="p-4">
			<p class="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
			<p class="text-sm text-gray-500">Questionnaire ID: {questionnaireId}</p>
		</div>
	{:else if questionnaire}
		<QuestionnaireResponseForm
			{questionnaire}
			onSubmit={handleSubmit}
			onError={(err) => { error = err.message; }}
		/>
	{:else}
		<div class="p-4 text-gray-600 dark:text-gray-300">
			<p>Questionnaire not found.</p>
		</div>
	{/if}
</Modal>
