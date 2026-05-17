<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import { getFHIRResource, getFHIRResources } from '$lib/fhir';
	import { humanDateTime } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import type { Encounter, Bundle, Observation, DocumentReference } from 'fhir/r4b';

	const { encounterId } = $page.params;

	const encounterState = createServiceState<Encounter>(async () => {
		return getFHIRResource<Encounter>({ reference: `Encounter/${encounterId}` });
	});

	const observationsState = createServiceState<Bundle>(async () => {
		return getFHIRResources<Observation>('Observation', { encounter: `Encounter/${encounterId}` });
	});

	const docsState = createServiceState<Bundle>(async () => {
		return getFHIRResources<DocumentReference>('DocumentReference', { encounter: `Encounter/${encounterId}` });
	});

	let activeTab = $state('overview');

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'observations', label: 'Observations' },
		{ id: 'documents', label: 'Documents' }
	];

	$effect(() => {
		encounterState.reload();
		observationsState.reload();
		docsState.reload();
	});
</script>

{#if encounterState.data.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if encounterState.data.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading encounter: {encounterState.data.error?.message || 'Unknown error'}</p>
	</div>
{:else if encounterState.data.status === 'success'}
	{@const encounter = encounterState.data.data}
	<PageContainer title="Encounter" variant="with-tabs">
		{#snippet headerContent()}
			<div class="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
				{#each tabs as tab}
					<button
						class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
						onclick={() => activeTab = tab.id}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		{/snippet}

		{#if activeTab === 'overview'}
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
						<p class="text-lg font-medium">{encounter.status || '-'}</p>
					</div>
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Class</p>
						<p class="text-lg font-medium">{encounter.class?.display || encounter.class?.code || '-'}</p>
					</div>
				</div>
				{#if encounter.period?.start}
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Period</p>
						<p>{humanDateTime(encounter.period.start)} {#if encounter.period.end} - {humanDateTime(encounter.period.end)}{/if}</p>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'observations'}
			{#if observationsState.data.status === 'success'}
				{@const bundle = observationsState.data.data}
				{@const observations = bundle.entry?.map((e) => e.resource as Observation).filter((r): r is Observation => !!r) || []}
				{#if observations.length > 0}
					<div class="space-y-2">
						{#each observations as obs}
							<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p class="font-medium">{obs.code?.text || obs.code?.coding?.[0]?.display || 'Observation'}</p>
								<p class="text-sm text-gray-500">{obs.valueString || obs.valueQuantity?.value || '-'}</p>
							</div>
						{/each}
					</div>
				{:else}
					<Empty message="No observations found" />
				{/if}
			{:else}
				<Spinner />
			{/if}
		{:else}
			{#if docsState.data.status === 'success'}
				{@const bundle = docsState.data.data}
				{@const docs = bundle.entry?.map((e) => e.resource as DocumentReference).filter((r): r is DocumentReference => !!r) || []}
				{#if docs.length > 0}
					<div class="space-y-2">
						{#each docs as doc}
							<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p class="font-medium">{doc.type?.text || doc.type?.coding?.[0]?.display || 'Document'}</p>
								<p class="text-sm text-gray-500">{doc.status}</p>
							</div>
						{/each}
					</div>
				{:else}
					<Empty message="No documents found" />
				{/if}
			{:else}
				<Spinner />
			{/if}
		{/if}
	</PageContainer>
{/if}
