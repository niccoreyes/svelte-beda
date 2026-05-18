<script lang="ts">
	import type { Bundle, FhirResource } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import SearchBar, { serializeFilters } from '$lib/components/SearchBar.svelte';
	import type { FilterConfig } from '$lib/components/SearchBar.svelte';
	import ResourceTable from '$lib/components/table/ResourceTable.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const resourceTypes = [
		{ value: 'Observation', label: 'Observations' },
		{ value: 'Condition', label: 'Conditions' },
		{ value: 'AllergyIntolerance', label: 'Allergies' },
		{ value: 'MedicationRequest', label: 'Medications' },
		{ value: 'Procedure', label: 'Procedures' },
		{ value: 'DiagnosticReport', label: 'Diagnostic Reports' },
		{ value: 'Immunization', label: 'Immunizations' },
		{ value: 'CarePlan', label: 'Care Plans' }
	];

	let selectedType = $state('Observation');
	let filters = $state<FilterConfig[]>([
		{ id: '_content', label: 'Search', type: 'STRING', placeholder: 'Search resources...' }
	]);

	const resourcesState = createServiceState<Bundle>(async () => {
		const searchParams: Record<string, string | string[] | undefined> = {
			patient: `Patient/${patientId}`,
			_sort: '-_lastUpdated',
			_count: '20'
		};
		const serialized = serializeFilters(filters);
		if (serialized._content) {
			searchParams._content = serialized._content;
		}
		return getFHIRResources(selectedType, searchParams);
	});

	$effect(() => {
		if (patientId && selectedType) {
			resourcesState.reload();
		}
	});

	function onFilterChange(id: string, value: string) {
		filters = filters.map((f) => (f.id === id ? { ...f, value } : f));
	}

	function onClearFilters() {
		filters = filters.map((f) => ({ ...f, value: undefined }));
	}
</script>

<div class="space-y-4">
	<div class="flex flex-col sm:flex-row gap-3">
		<select
			value={selectedType}
			onchange={(e) => (selectedType = e.currentTarget.value)}
			class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
		>
			{#each resourceTypes as rt (rt.value)}
				<option value={rt.value}>{rt.label}</option>
			{/each}
		</select>
		<div class="flex-1">
			<SearchBar {filters} {onFilterChange} {onClearFilters} />
		</div>
	</div>

	<RenderRemoteData remoteData={resourcesState.data}>
			{#snippet children(data)}
				{@const bundle = data as Bundle}
				{@const resources = (bundle.entry?.map((e) => e.resource as FhirResource).filter(Boolean) || []) as FhirResource[]}
				{#if resources.length > 0}
					<ResourceTable
						data={resources}
						columns={[
							{ key: 'resourceType', header: 'Type', cell: (r) => (r as FhirResource).resourceType },
							{ key: 'id', header: 'ID', cell: (r) => (r as FhirResource).id || '-' },
							{ key: 'meta', header: 'Last Updated', cell: (r) => (r as { meta?: { lastUpdated?: string } }).meta?.lastUpdated || '-' }
						]}
						pageSize={10}
					/>
				{:else}
					<Empty message={`No ${selectedType} resources found`} />
				{/if}
			{/snippet}
	</RenderRemoteData>
</div>
