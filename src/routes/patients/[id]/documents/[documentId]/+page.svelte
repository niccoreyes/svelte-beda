<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire, Patient, QuestionnaireResponse } from 'fhir/r4b';
	import { getPatientName } from '$lib/utils';
	import PatientDocumentForm from '$lib/components/patient/PatientDocumentForm.svelte';

	const patientId = $page.params.id!;
	const documentId = $page.params.documentId;

	const questionnaireState = createServiceState<Questionnaire>(async () => {
		return getFHIRResource<Questionnaire>({ reference: `Questionnaire/${documentId}` });
	});

	const patientState = createServiceState<Patient>(async () => {
		return getFHIRResource<Patient>({ reference: `Patient/${patientId}` });
	});

	$effect(() => {
		questionnaireState.reload();
		patientState.reload();
	});

	function handleSaved(response: QuestionnaireResponse) {
		const qrId = response.id;
		if (qrId) {
			goto(resolve(`/patients/${patientId}/documents/${qrId}/details`));
		} else {
			goto(resolve(`/patients/${patientId}`));
		}
	}
</script>

<PageContainer
	title={questionnaireState.data.status === 'success' && patientState.data.status === 'success'
		? `Fill Document — ${questionnaireState.data.data.title || 'Untitled'} for ${getPatientName(patientState.data.data)}`
		: 'Fill Document'}
	variant="default"
>
	{#if questionnaireState.data.status === 'loading' || patientState.data.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if questionnaireState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading questionnaire: {questionnaireState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if patientState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading patient: {patientState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if questionnaireState.data.status === 'success' && patientState.data.status === 'success'}
		{@const questionnaire = questionnaireState.data.data}
		{@const patient = patientState.data.data}
		<div class="max-w-3xl mx-auto">
			<div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
				Filling for patient: <span class="font-medium">{getPatientName(patient)}</span>
			</div>
			<PatientDocumentForm
				{questionnaire}
				{patientId}
				onSaved={handleSaved}
			/>
		</div>
	{/if}
</PageContainer>
