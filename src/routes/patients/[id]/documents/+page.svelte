<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Spinner, Empty, Modal } from '$lib/components';
	import { remoteRead, remoteSearch, remoteHistory } from '$lib/fhir';
	import { notAsked, loading, type RemoteData } from '$lib/state';
	import type { DocumentReference, Patient, FhirResource } from 'fhir/r4b';
	import { getPatientName } from '$lib/utils';
	import DocumentsList from '$lib/components/documents/DocumentsList.svelte';
	import ChooseDocumentToCreateModal from '$lib/components/documents/ChooseDocumentToCreateModal.svelte';
	import RenderBundleResourceContext from '$lib/components/documents/RenderBundleResourceContext.svelte';

	let patientId = $derived($page.params.id);

	let patientState = $state<RemoteData<Patient, Error>>(notAsked());
	let documentsState = $state<RemoteData<DocumentReference[], Error>>(notAsked());
	let searchQuery = $state('');
	let showCreateModal = $state(false);
	let showHistoryModal = $state(false);
	let historyState = $state<RemoteData<{ entry?: Array<{ resource?: FhirResource }> }, Error>>(notAsked());

	async function loadPatient(id: string) {
		patientState = loading();
		patientState = await remoteRead<Patient>(`Patient/${id}`);
	}

	async function loadDocuments(id: string) {
		documentsState = loading();
		const result = await remoteSearch('DocumentReference', {
			subject: `Patient/${id}`,
			_count: '50',
			_sort: '-_lastUpdated'
		});
		if (result.status === 'success') {
			const docs = result.data.entry?.map((e) => e.resource as DocumentReference).filter((r): r is DocumentReference => !!r) || [];
			documentsState = { status: 'success', data: docs };
		} else {
			documentsState = result as RemoteData<DocumentReference[], Error>;
		}
	}

	$effect(() => {
		if (patientId) {
			loadPatient(patientId);
			loadDocuments(patientId);
		}
	});

	const filteredDocs = $derived(() => {
		if (documentsState.status !== 'success') return [];
		if (!searchQuery) return documentsState.data;
		const q = searchQuery.toLowerCase();
		return documentsState.data.filter((d) => {
			const text = [
				d.description,
				d.type?.text,
				d.type?.coding?.[0]?.display,
				d.type?.coding?.[0]?.code,
				d.content?.[0]?.attachment?.title,
				d.docStatus
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return text.includes(q);
		});
	});

	function handleSearch(query: string) {
		searchQuery = query;
	}

	function handleCreate(type: string) {
		showCreateModal = false;
		// Navigate to document creation flow
		window.location.href = `/patients/${patientId}/documents/new?type=${type}`;
	}

	async function viewHistory(doc: DocumentReference) {
		showHistoryModal = true;
		historyState = loading();
		if (!doc.id) {
			historyState = { status: 'failure', error: new Error('Document has no ID') };
			return;
		}
		const result = await remoteHistory<FhirResource>(`DocumentReference/${doc.id}`);
		if (result.status === 'success') {
			historyState = { status: 'success', data: result.data };
		} else {
			historyState = result as RemoteData<{ entry?: Array<{ resource?: FhirResource }> }, Error>;
		}
	}
</script>

<PageContainer
	title={patientState.status === 'success' ? `Documents — ${getPatientName(patientState.data)}` : 'Documents'}
	variant="default"
>
	{#snippet titleRightElement()}
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
		>
			+ New Document
		</button>
	{/snippet}

	{#if documentsState.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if documentsState.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading documents: {documentsState.error?.message || 'Unknown error'}</p>
		</div>
	{:else if documentsState.status === 'success'}
		{@const docs = filteredDocs()}
		<DocumentsList
			documents={docs}
			{searchQuery}
			onSearch={handleSearch}
			onViewHistory={viewHistory}
		/>
	{/if}
</PageContainer>

<ChooseDocumentToCreateModal
	open={showCreateModal}
	onClose={() => (showCreateModal = false)}
	onSelect={handleCreate}
/>

<Modal
	open={showHistoryModal}
	title="Document History"
	onClose={() => {
		showHistoryModal = false;
	}}
>
	{#if historyState.status === 'loading'}
		<div class="flex items-center justify-center h-32">
			<Spinner />
		</div>
	{:else if historyState.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {historyState.error?.message || 'Unknown error'}</p>
		</div>
	{:else if historyState.status === 'success'}
		{@const entries = historyState.data.entry || []}
		{#if entries.length === 0}
			<Empty message="No history found" />
		{:else}
			<div class="space-y-3 max-h-96 overflow-y-auto">
				{#each entries as entry, idx (idx)}
					<div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
						<div class="flex items-center justify-between mb-1">
							<span class="text-xs font-medium text-[var(--gray-7)]">Version {entries.length - idx}</span>
							{#if entry.resource?.meta?.versionId}
								<span class="text-xs text-[var(--gray-6)]">{entry.resource.meta.versionId}</span>
							{/if}
						</div>
						<RenderBundleResourceContext {entry} />
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</Modal>
