<script lang="ts">
	import type { DocumentReference } from 'fhir/r4b';
	import { humanDate } from '$lib/utils';

	interface Props {
		documents: DocumentReference[];
		searchQuery?: string;
		onSearch?: (query: string) => void;
		onSelect?: (doc: DocumentReference) => void;
		onViewHistory?: (doc: DocumentReference) => void;
	}

	let { documents, searchQuery = '', onSearch, onSelect, onViewHistory }: Props = $props();
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex-1 max-w-md">
			<input
				type="text"
				value={searchQuery}
				oninput={(e) => onSearch?.(e.currentTarget.value)}
				placeholder="Search documents..."
				class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>
		<span class="text-sm text-gray-500 dark:text-gray-400 ml-4">
			{documents.length} document{documents.length === 1 ? '' : 's'}
		</span>
	</div>

	{#if documents.length === 0}
		<div class="text-center py-12 text-gray-400">
			<p class="text-sm">No documents found</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
			<table class="w-full text-sm text-left">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th class="px-4 py-3">Description</th>
						<th class="px-4 py-3">Type</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3">Date</th>
						<th class="px-4 py-3">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each documents as doc}
						<tr
							class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							<td class="px-4 py-3">
								<p class="font-medium text-gray-900 dark:text-white">
									{doc.description || doc.content?.[0]?.attachment?.title || 'Untitled'}
								</p>
								{#if doc.content?.[0]?.attachment?.contentType}
									<p class="text-xs text-gray-500">{doc.content[0].attachment.contentType}</p>
								{/if}
							</td>
							<td class="px-4 py-3">
								{doc.type?.text || doc.type?.coding?.[0]?.display || doc.type?.coding?.[0]?.code || '-'}
							</td>
							<td class="px-4 py-3">
								<span class="px-2 py-1 text-xs rounded-full {doc.status === 'current' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}">
									{doc.status || '-'}
								</span>
							</td>
							<td class="px-4 py-3 text-gray-500 dark:text-gray-400">
								{humanDate(doc.date)}
							</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									{#if onSelect}
										<button
											onclick={() => onSelect(doc)}
											class="text-sm text-primary hover:underline"
										>
											View
										</button>
									{/if}
									{#if onViewHistory}
										<button
											onclick={() => onViewHistory(doc)}
											class="text-sm text-gray-500 hover:text-primary"
										>
											History
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
