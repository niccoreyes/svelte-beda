<script lang="ts">
	import type { QuestionnaireResponse, Bundle } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate, getReferenceId } from '$lib/utils';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import DocumentHistory from './DocumentHistory.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	let searchQuery = $state('');
	let historyOpen = $state(false);
	let selectedQrId = $state<string | null>(null);

	const qrState = createServiceState<Bundle>(async () => {
		return getFHIRResources('QuestionnaireResponse', {
			subject: `Patient/${patientId}`,
			_sort: '-authored',
			_count: '50'
		});
	});

	$effect(() => {
		if (patientId) {
			qrState.reload();
		}
	});

	const responses = $derived(() => {
		if (qrState.data.status !== 'success') return [];
		const entries = qrState.data.data.entry || [];
		const qrs = entries
			.map((e) => e.resource as QuestionnaireResponse)
			.filter((r): r is QuestionnaireResponse => !!r);
		if (!searchQuery) return qrs;
		const q = searchQuery.toLowerCase();
		return qrs.filter((qr) => {
			const text = [
				qr.questionnaire,
				qr.status,
				qr.authored
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return text.includes(q);
		});
	});

	function openHistory(qr: QuestionnaireResponse) {
		if (!qr.id) return;
		selectedQrId = qr.id;
		historyOpen = true;
	}

	function closeHistory() {
		historyOpen = false;
		selectedQrId = null;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex-1 max-w-md">
			<SearchBar
				filters={[
					{ id: 'search', label: 'Search', type: 'STRING', value: searchQuery, placeholder: 'Search documents...' }
				]}
				onFilterChange={(id, value) => {
					if (id === 'search') searchQuery = value;
				}}
				onClearFilters={() => (searchQuery = '')}
			/>
		</div>
	</div>

	<RenderRemoteData remoteData={qrState.data}>
		{#snippet children(data)}
			{@const qrs = responses()}
			{#if qrs.length > 0}
				<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
					<table class="w-full text-sm text-left">
						<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
							<tr>
								<th class="px-4 py-3">Questionnaire</th>
								<th class="px-4 py-3">Status</th>
								<th class="px-4 py-3">Authored</th>
								<th class="px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each qrs as qr}
								<tr
									class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								>
									<td class="px-4 py-3">
										<p class="font-medium text-gray-900 dark:text-white">
											{qr.questionnaire || 'Untitled'}
										</p>
									</td>
									<td class="px-4 py-3">
										<span class="px-2 py-1 text-xs rounded-full {qr.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : qr.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}">
											{qr.status || '-'}
										</span>
									</td>
									<td class="px-4 py-3 text-gray-500 dark:text-gray-400">
										{qr.authored ? humanDate(qr.authored) : '-'}
									</td>
									<td class="px-4 py-3">
										<div class="flex items-center gap-2">
											{#if qr.questionnaire}
												<a
													href={`/patients/${patientId}/documents/${getReferenceId(qr.questionnaire)}`}
													class="text-sm text-primary hover:underline"
												>
													Fill
												</a>
											{/if}
											{#if qr.id}
												<a
													href={`/patients/${patientId}/documents/${qr.id}/details`}
													class="text-sm text-primary hover:underline"
												>
													View
												</a>
											{/if}
											<button
												onclick={() => openHistory(qr)}
												class="text-sm text-gray-500 hover:text-primary"
											>
												View History
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<Empty message="No documents found" />
			{/if}
		{/snippet}
	</RenderRemoteData>
</div>

<Modal open={historyOpen} title="Document History" onClose={closeHistory}>
	{#if selectedQrId}
		<DocumentHistory
			resourceType="QuestionnaireResponse"
			resourceId={selectedQrId}
			open={historyOpen}
		/>
	{/if}
</Modal>
