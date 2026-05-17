<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');

	const formState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { context: 'form-library', _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params['name:contains'] = searchQuery;
		return getFHIRResources<Questionnaire>('Questionnaire', params);
	});

	$effect(() => {
		searchQuery;
		formState.reload();
	});

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Forms Library" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if formState.data.status === 'loading'}
		<Spinner />
	{:else if formState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {formState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if formState.data.status === 'success'}
		{@const bundle = formState.data.data}
		{@const forms = bundle.entry?.map((e) => e.resource as Questionnaire).filter((r): r is Questionnaire => !!r) || []}
		{#if forms.length > 0}
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
						{#each forms as form}
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
									{form.title || form.name || form.id || 'Unknown'}
								</td>
								<td class="px-6 py-4">
									{form.status || '-'}
								</td>
								<td class="px-6 py-4">
									<div class="flex space-x-2">
										<a href="/questionnaires/{form.id}" class="text-primary hover:underline text-sm">View</a>
										<a href="/questionnaires/{form.id}/edit" class="text-primary hover:underline text-sm">Edit</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Empty message="No forms found" />
		{/if}
	{/if}
</PageContainer>
