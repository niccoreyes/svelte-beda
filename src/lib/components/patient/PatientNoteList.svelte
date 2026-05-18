<script lang="ts">
	import type { DocumentReference } from 'fhir/r4b';
	import { humanDate } from '$lib/utils';
	import { resolve } from '$app/paths';

	interface Props {
		patientId: string;
		notes: DocumentReference[];
	}

	let { patientId, notes }: Props = $props();

	function getNoteTitle(note: DocumentReference): string {
		return (
			note.content?.[0]?.attachment?.title ||
			note.type?.text ||
			note.type?.coding?.[0]?.display ||
			'Note'
		);
	}

	function getNoteContent(note: DocumentReference): string {
		const data = note.content?.[0]?.attachment?.data;
		if (!data) return '';
		try {
			return decodeURIComponent(escape(atob(data)));
		} catch {
			return '';
		}
	}

	function getContentPreview(note: DocumentReference): string {
		const content = getNoteContent(note);
		return content.length > 120 ? content.slice(0, 120) + '...' : content;
	}

	function getAuthor(note: DocumentReference): string {
		const author = note.author?.[0];
		if (!author) return 'Unknown';
		return author.display || author.reference || 'Unknown';
	}
</script>

<div class="space-y-3">
	{#if notes.length === 0}
		<p class="text-sm text-gray-500 dark:text-gray-400">No notes available.</p>
	{:else}
		{#each notes as note (note.id)}
			<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<div class="flex items-start justify-between gap-2">
					<h4 class="text-sm font-medium text-gray-900 dark:text-white">
						{getNoteTitle(note)}
					</h4>
					<span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">
						{note.date ? humanDate(note.date) : '-'}
					</span>
				</div>
				{#if getContentPreview(note)}
					<p class="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
						{getContentPreview(note)}
					</p>
				{/if}
				<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
					By {getAuthor(note)}
				</p>
			</div>
		{/each}
		<div class="text-right">
			<a href={resolve(`/patients/${patientId}/documents`)} class="text-xs text-primary hover:underline">
				View all →
			</a>
		</div>
	{/if}
</div>
