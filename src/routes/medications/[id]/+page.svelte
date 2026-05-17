<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { MedicationRequest } from 'fhir/r4b';

	const id = $page.params.id;

	const medicationState = createServiceState<MedicationRequest>(async () => {
		return getFHIRResource<MedicationRequest>({ reference: `MedicationRequest/${id}` });
	});

	$effect(() => {
		medicationState.reload();
	});
</script>

<PageContainer title="Medication Details" variant="default">
	{#if medicationState.data.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if medicationState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading medication: {medicationState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if medicationState.data.status === 'success'}
		{@const medication = medicationState.data.data}
		<div class="space-y-4">
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Medication</p>
				<p class="text-lg font-medium">{medication.medicationCodeableConcept?.text || medication.medicationReference?.display || 'Unknown'}</p>
			</div>
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
				<p class="text-lg font-medium">{medication.status || '-'}</p>
			</div>
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Intent</p>
				<p class="text-lg font-medium">{medication.intent || '-'}</p>
			</div>
		</div>
	{/if}
</PageContainer>
