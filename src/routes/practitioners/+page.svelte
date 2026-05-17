<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Practitioner, Bundle, PractitionerRole } from 'fhir/r4b';

	let searchQuery = $state('');

	const practitionerState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params.name = searchQuery;
		return getFHIRResources<Practitioner>('Practitioner', params);
	});

	$effect(() => {
		searchQuery;
		practitionerState.reload();
	});

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	function getPractitionerSpecialty(p: Practitioner, bundle: Bundle): string {
		const roles = bundle.entry?.map((e) => e.resource as PractitionerRole).filter((r): r is PractitionerRole => (r as any)?.resourceType === 'PractitionerRole');
		const role = roles?.find((r) => r.practitioner?.reference?.includes(p.id || ''));
		return role?.specialty?.map((s) => s.coding?.[0]?.display || s.text).filter(Boolean).join(', ') || '-';
	}

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Practitioners" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if practitionerState.data.status === 'loading'}
		<Spinner />
	{:else if practitionerState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {practitionerState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if practitionerState.data.status === 'success'}
		{@const bundle = practitionerState.data.data}
		{@const practitioners = bundle.entry?.map((e) => e.resource as Practitioner).filter((r): r is Practitioner => !!r) || []}
		{#if practitioners.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Specialty</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each practitioners as practitioner}
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
									{getPractitionerName(practitioner)}
								</td>
								<td class="px-6 py-4">
									{getPractitionerSpecialty(practitioner, bundle)}
								</td>
								<td class="px-6 py-4">
									{#if practitioner.id}
										<a href="/practitioners/{practitioner.id}" class="text-primary hover:underline text-sm">View</a>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Empty message="No practitioners found" />
		{/if}
	{/if}
</PageContainer>
