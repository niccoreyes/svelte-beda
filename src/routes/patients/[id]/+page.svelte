<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import { remoteRead, remoteSearch } from '$lib/fhir';
	import { getPatientName, humanDate } from '$lib/utils';
	import { notAsked, loading, type RemoteData } from '$lib/state';
	import type { Patient, Encounter, Bundle } from 'fhir/r4b';

	let patientState = $state<RemoteData<Patient, Error>>(notAsked());
	let encountersState = $state<RemoteData<Bundle, Error>>(notAsked());

	async function loadPatient(currentId: string) {
		patientState = loading();
		patientState = await remoteRead<Patient>(`Patient/${currentId}`);
	}

	async function loadEncounters(currentId: string) {
		encountersState = loading();
		encountersState = await remoteSearch('Encounter', { subject: `Patient/${currentId}`, _sort: '-date' });
	}

	$effect(() => {
		const currentId = $page.params.id;
		if (currentId) {
			loadPatient(currentId);
			loadEncounters(currentId);
		}
	});

	let activeTab = $state('overview');

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'encounters', label: 'Encounters' },
		{ id: 'documents', label: 'Documents' },
		{ id: 'forms', label: 'Forms' },
		{ id: 'resources', label: 'Resources' }
	];
</script>

{#if patientState.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if patientState.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading patient: {patientState.error?.message || 'Unknown error'}</p>
	</div>
{:else if patientState.status === 'success'}
	{@const patient = patientState.data}
	<PageContainer title={getPatientName(patient)} variant="with-tabs">
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
						<p class="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
						<p class="text-lg font-medium">{humanDate(patient.birthDate) || '-'}</p>
					</div>
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Gender</p>
						<p class="text-lg font-medium">{patient.gender || '-'}</p>
					</div>
				</div>
				{#if patient.address && patient.address.length > 0}
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Address</p>
						<p>{patient.address.map((a) => [a.line?.join(', '), a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')).join('; ')}</p>
					</div>
				{/if}
			</div>
		{:else if activeTab === 'encounters'}
			{#if encountersState.status === 'loading'}
				<div class="flex items-center justify-center h-32">
					<Spinner />
				</div>
			{:else if encountersState.status === 'success'}
				{@const bundle = encountersState.data}
				{@const encounters = bundle.entry?.map((e) => e.resource as Encounter).filter((r): r is Encounter => !!r) || []}
				{#if encounters.length > 0}
					<div class="space-y-2">
						{#each encounters as encounter}
							<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p class="font-medium">{encounter.class?.display || 'Encounter'}</p>
								<p class="text-sm text-gray-500">{encounter.status}</p>
							</div>
						{/each}
					</div>
				{:else}
					<Empty message="No encounters found" />
				{/if}
			{:else if encountersState.status === 'failure'}
				<div class="p-4 text-error">
					<p>Error loading encounters: {encountersState.error?.message || 'Unknown error'}</p>
				</div>
			{/if}
		{:else}
			<Empty message="{activeTab} coming soon" />
		{/if}
	</PageContainer>
{/if}
