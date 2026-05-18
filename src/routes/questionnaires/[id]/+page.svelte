<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire } from 'fhir/r4b';

	const id = $page.params.id;

	const questionnaireState = createServiceState<Questionnaire>(async () => {
		return getFHIRResource<Questionnaire>({ reference: `Questionnaire/${id}` });
	});

	$effect(() => {
		questionnaireState.reload();
	});
</script>

<PageContainer title="Questionnaire Details" variant="default">
	{#if questionnaireState.data.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if questionnaireState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading questionnaire: {questionnaireState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if questionnaireState.data.status === 'success'}
		{@const q = questionnaireState.data.data}
		<div class="space-y-4">
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Title</p>
				<p class="text-lg font-medium">{q.title || q.name || 'Untitled'}</p>
			</div>
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
				<p class="text-lg font-medium">{q.status || '-'}</p>
			</div>
			<div class="flex space-x-2">
				<a 				href={resolve(`/questionnaires/${id}/edit`)} class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
					Edit
				</a>
			</div>
		</div>
	{/if}
</PageContainer>
