<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { QuestionnaireResponse } from 'fhir/r4b';

	const { qrId } = $page.params;

	const qrState = createServiceState<QuestionnaireResponse>(async () => {
		return getFHIRResource<QuestionnaireResponse>({ reference: `QuestionnaireResponse/${qrId}` });
	});

	$effect(() => {
		qrState.reload();
	});
</script>

{#if qrState.data.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if qrState.data.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading document: {qrState.data.error?.message || 'Unknown error'}</p>
	</div>
{:else if qrState.data.status === 'success'}
	{@const qr = qrState.data.data}
	<PageContainer title="Document" variant="default">
		<div class="space-y-4">
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Questionnaire</p>
				<p class="text-lg font-medium">{qr.questionnaire || '-'}</p>
			</div>
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
				<p class="text-lg font-medium">{qr.status || '-'}</p>
			</div>
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Authored</p>
				<p class="text-lg font-medium">{qr.authored || '-'}</p>
			</div>
		</div>
	</PageContainer>
{/if}
