<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');

	const questionnaireState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params['name:contains'] = searchQuery;
		return getFHIRResources<Questionnaire>('Questionnaire', params);
	});

	$effect(() => {
		searchQuery;
		questionnaireState.reload();
	});

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Questionnaires" variant="with-table">
	<div class="mb-4 flex items-center justify-between">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
		<a href="/questionnaires/builder" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
			+ Add Questionnaire
		</a>
	</div>

	{#if questionnaireState.data.status === 'loading'}
		<Spinner />
	{:else if questionnaireState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {questionnaireState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if questionnaireState.data.status === 'success'}
		{@const bundle = questionnaireState.data.data}
		{@const questionnaires = bundle.entry?.map((e) => e.resource as Questionnaire).filter((r): r is Questionnaire => !!r) || []}
		{#if questionnaires.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Status</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each questionnaires as q}
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
									{q.title || q.name || q.id || 'Unknown'}
								</td>
								<td class="px-6 py-4">
									{q.status || '-'}
								</td>
								<td class="px-6 py-4">
									<div class="flex space-x-2">
										<a href="/questionnaires/{q.id}" class="text-primary hover:underline text-sm">View</a>
										<a href="/questionnaires/{q.id}/edit" class="text-primary hover:underline text-sm">Edit</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Empty message="No questionnaires found" />
		{/if}
	{/if}
</PageContainer>
