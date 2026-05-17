<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { MedicationKnowledge, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');

	const medicationState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params.code = searchQuery;
		return getFHIRResources<MedicationKnowledge>('MedicationKnowledge', params);
	});

	$effect(() => {
		medicationState.reload();
	});

	function getMedicationName(m: MedicationKnowledge): string {
		return m.code?.coding?.[0]?.display || m.code?.text || 'Unknown';
	}

	function getMedicationCost(m: MedicationKnowledge): string {
		const cost = m.cost?.[0]?.cost;
		return cost?.value && cost?.currency ? `${cost.value} ${cost.currency}` : '-';
	}

	const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => getMedicationName(row as MedicationKnowledge)
		},
		{
			key: 'cost',
			header: 'Cost',
			cell: (row: unknown) => getMedicationCost(row as MedicationKnowledge)
		}
	];

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Medications" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'code', label: 'Code', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if medicationState.data.status === 'loading'}
		<Spinner />
	{:else if medicationState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {medicationState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if medicationState.data.status === 'success'}
		{@const bundle = medicationState.data.data}
		{@const medications = bundle.entry?.map((e) => e.resource as MedicationKnowledge).filter((r): r is MedicationKnowledge => !!r) || []}
		{#if medications.length > 0}
			<ResourceTable data={medications} {columns} pageSize={10} />
		{:else}
			<Empty message="No medications found" />
		{/if}
	{/if}
</PageContainer>
