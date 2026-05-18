<script lang="ts">
	import type { DocumentReference } from 'fhir/r4b';
	import { humanDate } from '$lib/utils';

	interface Props {
		document: DocumentReference;
	}

	let { document }: Props = $props();
</script>

<div class="print-container">
	<div class="no-print mb-4">
		<button
			onclick={() => window.print()}
			class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
		>
			Print
		</button>
	</div>

	<div class="document-content">
		<h1 class="text-2xl font-bold mb-2">{document.type?.text || document.type?.coding?.[0]?.display || 'Document'}</h1>
		<div class="text-sm text-gray-600 dark:text-gray-400 mb-6">
			<p>Status: <span class="font-medium">{document.status}</span></p>
			<p>Date: <span class="font-medium">{document.date ? humanDate(document.date) : '-'}</span></p>
			{#if document.author && document.author.length > 0}
				<p>Author: <span class="font-medium">{document.author.map((a) => a.display || a.reference).join(', ')}</span></p>
			{/if}
		</div>

		{#if document.content && document.content.length > 0}
			<div class="space-y-4">
				{#each document.content as content, i (i)}
					<div class="border-t pt-4">
						<p class="text-xs text-gray-500 mb-1">Attachment {i + 1}</p>
						{#if content.attachment?.title}
							<p class="font-medium">{content.attachment.title}</p>
						{/if}
						{#if content.attachment?.contentType}
							<p class="text-sm text-gray-500">{content.attachment.contentType}</p>
						{/if}
						{#if content.attachment?.url}
							<p class="text-sm text-gray-500 break-all">{content.attachment.url}</p>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 italic">No content available</p>
		{/if}

		{#if document.description}
			<div class="mt-6 border-t pt-4">
				<p class="text-sm whitespace-pre-wrap">{document.description}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	@media print {
		.no-print {
			display: none !important;
		}
		.print-container {
			padding: 0;
		}
		.document-content {
			color: black;
		}
	}
</style>
