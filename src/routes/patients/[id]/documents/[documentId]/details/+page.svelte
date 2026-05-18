<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { QuestionnaireResponse, Questionnaire } from 'fhir/r4b';
	import QuestionnaireResponseForm from '$lib/forms/QuestionnaireResponseForm.svelte';

	const patientId = $page.params.id;
	const documentId = $page.params.documentId;

	const qrState = createServiceState<QuestionnaireResponse>(async () => {
		return getFHIRResource<QuestionnaireResponse>({ reference: `QuestionnaireResponse/${documentId}` });
	});

	const questionnaireState = createServiceState<Questionnaire>(async () => {
		const qr = qrState.data;
		if (qr.status === 'success' && qr.data.questionnaire) {
			const ref = qr.data.questionnaire;
			const [resourceType, id] = ref.split('/');
			return getFHIRResource<Questionnaire>({ reference: `${resourceType}/${id}` });
		}
		throw new Error('No questionnaire reference found');
	});

	$effect(() => {
		qrState.reload();
	});

	$effect(() => {
		if (qrState.data.status === 'success') {
			questionnaireState.reload();
		}
	});

	let editMode = $state(false);
	let saveError = $state<string | null>(null);

	async function handleSave(response: QuestionnaireResponse) {
		saveError = null;
		try {
			const { updateFHIRResource } = await import('$lib/fhir/client');
			await updateFHIRResource(response);
			editMode = false;
			qrState.reload();
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Failed to save';
		}
	}
</script>

<PageContainer
	title={qrState.data.status === 'success'
		? `Document Details — ${questionnaireState.data.status === 'success' ? questionnaireState.data.data.title || 'Untitled' : ''}`
		: 'Document Details'}
	variant="default"
>
	{#if qrState.data.status === 'loading' || questionnaireState.data.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if qrState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading response: {qrState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if questionnaireState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading questionnaire: {questionnaireState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if qrState.data.status === 'success' && questionnaireState.data.status === 'success'}
		{@const qr = qrState.data.data}
		{@const questionnaire = questionnaireState.data.data}
		<div class="max-w-3xl mx-auto space-y-4">
			<div class="flex items-center justify-between">
				<div class="text-sm text-gray-500 dark:text-gray-400">
					Status: <span class="font-medium">{qr.status || '-'}</span>
					{#if qr.authored}
						· Authored: {new Date(qr.authored).toLocaleString()}
					{/if}
				</div>
				<div class="flex gap-2">
					{#if !editMode}
						<button
							onclick={() => (editMode = true)}
							class="px-3 py-1.5 text-sm bg-primary text-white rounded hover:opacity-90 transition-opacity"
						>
							Edit
						</button>
							<a
								href={resolve(`/print-patient-document/${patientId}/${qr.id}`)}
								class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								Print
							</a>
						{:else}
							<button
								onclick={() => (editMode = false)}
								class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								Cancel
							</button>
						{/if}
						<a
							href={resolve(`/patients/${patientId}`)}
							class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							Back
						</a>
					</div>
				</div>

				{#if saveError}
					<div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
						{saveError}
					</div>
				{/if}

				{#if editMode}
					<QuestionnaireResponseForm
						{questionnaire}
						initialResponse={qr}
						subjectRef={qr.subject?.reference}
						authorRef={qr.author?.reference}
						onSubmit={handleSave}
					/>
				{:else}
					<QuestionnaireResponseForm
						{questionnaire}
						initialResponse={qr}
						subjectRef={qr.subject?.reference}
						authorRef={qr.author?.reference}
						readonly={true}
					/>
				{/if}
			</div>
	{/if}
</PageContainer>
