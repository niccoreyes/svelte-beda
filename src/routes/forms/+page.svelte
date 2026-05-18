<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire, Bundle } from 'fhir/r4b';
	import { resolve } from '$app/paths';

	let searchQuery = $state('');

	const formState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { context: 'form-library', _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params['name:contains'] = searchQuery;
		return getFHIRResources<Questionnaire>('Questionnaire', params);
	});

	$effect(() => {
		[searchQuery].forEach(() => {});
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
				<table class="w-full text-sm text-left text-[var(--gray-7)]">
					<thead class="text-xs text-[var(--gray-9)] uppercase bg-[var(--gray-3)] dark:bg-[var(--gray-4)] dark:text-[var(--gray-8)]">
						<tr>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Status</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each forms as form (form.id)}
							<tr class="bg-[var(--gray-1)] border-b dark:bg-[var(--gray-3)] dark:border-[var(--gray-5)] hover:bg-[var(--gray-3)] dark:hover:bg-[var(--gray-6)] transition-colors">
								<td class="px-6 py-4 font-medium text-[var(--gray-10)]">
									{form.title || form.name || form.id || 'Unknown'}
								</td>
								<td class="px-6 py-4">
									{form.status || '-'}
								</td>
								<td class="px-6 py-4">
									<div class="flex space-x-2">
										<a href={resolve(`/questionnaires/${form.id}`)} class="text-[var(--theme-primary)] hover:underline text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded">View</a>
										<a href={resolve(`/questionnaires/${form.id}/edit`)} class="text-[var(--theme-primary)] hover:underline text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded">Edit</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Empty message="No forms found" illustration="document" />
		{/if}
	{/if}
</PageContainer>
