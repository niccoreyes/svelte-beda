<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Questionnaire, Bundle } from 'fhir/r4b';
	import { resolve } from '$app/paths';

	let searchQuery = $state('');

	const questionnaireState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params['name:contains'] = searchQuery;
		return getFHIRResources<Questionnaire>('Questionnaire', params);
	});

	$effect(() => {
		[searchQuery].forEach(() => {});
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
	{#snippet titleRightElement()}
		<a
			href={resolve("/questionnaires/builder")}
			class="inline-flex items-center gap-1.5 rounded-md bg-[var(--theme-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Questionnaire</span>
		</a>
	{/snippet}
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
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
				<table class="w-full text-sm text-left text-[var(--gray-7)]">
					<thead class="text-xs text-[var(--gray-9)] uppercase bg-[var(--gray-3)] dark:bg-[var(--gray-4)] dark:text-[var(--gray-8)]">
						<tr>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Status</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each questionnaires as q (q.id)}
							<tr class="bg-[var(--gray-1)] border-b dark:bg-[var(--gray-3)] dark:border-[var(--gray-5)] hover:bg-[var(--gray-3)] dark:hover:bg-[var(--gray-6)] transition-colors">
								<td class="px-6 py-4 font-medium text-[var(--gray-10)]">
									{q.title || q.name || q.id || 'Unknown'}
								</td>
								<td class="px-6 py-4">
									{q.status || '-'}
								</td>
								<td class="px-6 py-4">
									<div class="flex space-x-2">
										<a href={resolve(`/questionnaires/${q.id}`)} class="text-[var(--theme-primary)] hover:underline text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded">View</a>
										<a href={resolve(`/questionnaires/${q.id}/edit`)} class="text-[var(--theme-primary)] hover:underline text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded">Edit</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Empty message="No questionnaires found" illustration="document" />
		{/if}
	{/if}
</PageContainer>
