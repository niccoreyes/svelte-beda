<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { HealthcareService, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');

	const serviceState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params.name = searchQuery;
		return getFHIRResources<HealthcareService>('HealthcareService', params);
	});

	$effect(() => {
		serviceState.reload();
	});

	function getServiceName(hs: HealthcareService): string {
		return hs.name || 'Unknown';
	}

	function getServiceDuration(hs: HealthcareService): string {
		const duration = hs.extension?.find((e) => e.url?.includes('healthcare-service-duration'))?.valueInteger;
		return duration ? `${duration} min` : '-';
	}

	function getServiceStatus(hs: HealthcareService): string {
		return hs.active ? 'Active' : 'Inactive';
	}

	const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => getServiceName(row as HealthcareService)
		},
		{
			key: 'duration',
			header: 'Duration (minutes)',
			cell: (row: unknown) => getServiceDuration(row as HealthcareService)
		},
		{
			key: 'status',
			header: 'Status',
			cell: (row: unknown) => getServiceStatus(row as HealthcareService)
		}
	];

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Healthcare Services" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if serviceState.data.status === 'loading'}
		<Spinner />
	{:else if serviceState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {serviceState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if serviceState.data.status === 'success'}
		{@const bundle = serviceState.data.data}
		{@const services = bundle.entry?.map((e) => e.resource as HealthcareService).filter((r): r is HealthcareService => !!r) || []}
		{#if services.length > 0}
			<ResourceTable data={services} {columns} pageSize={10} />
		{:else}
			<Empty message="No healthcare services found" />
		{/if}
	{/if}
</PageContainer>
