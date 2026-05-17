<script lang="ts">
	import { PageContainer, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { getPatientName } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import type { Patient, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');

	const patientState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _count: '20' };
		if (searchQuery) params.name = searchQuery;
		return getFHIRResources<Patient>('Patient', params);
	});

	$effect(() => {
		searchQuery;
		patientState.reload();
	});

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Patients" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if patientState.data.status === 'loading'}
		<Spinner />
	{:else if patientState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {patientState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if patientState.data.status === 'success'}
		{@const bundle = patientState.data.data}
		{@const patients = bundle.entry?.map((e) => e.resource as Patient).filter((r): r is Patient => !!r) || []}
		{#if patients.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
					<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th class="px-6 py-3">Name</th>
							<th class="px-6 py-3">Birth Date</th>
							<th class="px-6 py-3">Gender</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each patients as patient}
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
									{getPatientName(patient)}
								</td>
								<td class="px-6 py-4">
									{patient.birthDate || '-'}
								</td>
								<td class="px-6 py-4">
									{patient.gender || '-'}
								</td>
								<td class="px-6 py-4">
									{#if patient.id}
										<a href="/patients/{patient.id}" class="text-primary hover:underline text-sm">View</a>
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
			<Empty message="No patients found" />
		{/if}
	{/if}
</PageContainer>
