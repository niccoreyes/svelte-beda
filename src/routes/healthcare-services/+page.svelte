<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
import { getFHIRResources } from '$lib/fhir';
import { createServiceState } from '$lib/state';
import { serializeFilters } from '$lib/utils/searchParams';
import HeaderActionButton from '$lib/components/HeaderActionButton.svelte';
import CreateResourceModal from '$lib/components/CreateResourceModal.svelte';
	import type { HealthcareService, Bundle } from 'fhir/r4b';

	let filters = $state([
	{ id: 'name', label: 'Name', type: 'STRING' as const, value: '', searchParam: 'name' }
]);
let createModalOpen = $state(false);

const serviceState = createServiceState<Bundle>(async () => {
	const params: Record<string, string | string[]> = { _sort: '-_lastUpdated,_id', _count: '20' };
	const serialized = serializeFilters(filters);
	Object.assign(params, serialized);
	return getFHIRResources<HealthcareService>('HealthcareService', params);
});

	$effect(() => {
		[filters].forEach(() => {});
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

function handleFilterChange(id: string, value: string) {
	filters = filters.map(f => f.id === id ? { ...f, value } : f);
}

function handleClear() {
	filters = filters.map(f => ({ ...f, value: '' }));
}
</script>

<PageContainer title="Healthcare Services" variant="with-table">
	{#snippet titleRightElement()}
		<HeaderActionButton
			label="Add Healthcare Service"
			onClick={() => createModalOpen = true}
		>
			{#snippet icon()}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			{/snippet}
		</HeaderActionButton>
	{/snippet}
	<div class="mb-4">
		<SearchBar
			{filters}
			onFilterChange={handleFilterChange}
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

<CreateResourceModal
	questionnaireId="healthcare-service-create"
	open={createModalOpen}
	onClose={() => createModalOpen = false}
	onSuccess={() => {
		createModalOpen = false;
		serviceState.reload();
	}}
/>
