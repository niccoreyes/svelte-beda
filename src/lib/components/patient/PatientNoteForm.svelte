<script lang="ts">
	import { createFHIRResource } from '$lib/fhir';
	import type { DocumentReference } from 'fhir/r4b';

	interface Props {
		patientId: string;
		onSave?: () => void;
		onCancel?: () => void;
	}

	let { patientId, onSave, onCancel }: Props = $props();

	let title = $state('');
	let content = $state('');
	let showPreview = $state(false);
	let submitting = $state(false);
	let error = $state('');

	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function simpleMarkdownToHtml(md: string): string {
		return escapeHtml(md)
			.replace(/^### (.*$)/gim, '<h3>$1</h3>')
			.replace(/^## (.*$)/gim, '<h2>$1</h2>')
			.replace(/^# (.*$)/gim, '<h1>$1</h1>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/^- (.*$)/gim, '<li>$1</li>')
			.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
			.replace(/\n/g, '<br>');
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		if (!content.trim()) {
			error = 'Content is required';
			return;
		}

		submitting = true;
		error = '';

		try {
			const encodedContent = btoa(unescape(encodeURIComponent(content)));

			const note: DocumentReference = {
				resourceType: 'DocumentReference',
				status: 'current',
				type: {
					coding: [
						{
							system: 'http://loinc.org',
							code: '11506-3',
							display: 'Progress note'
						}
					],
					text: 'clinical-note'
				},
				subject: { reference: `Patient/${patientId}` },
				date: new Date().toISOString(),
				content: [
					{
						attachment: {
							contentType: 'text/markdown',
							data: encodedContent,
							title: title.trim()
						}
					}
				]
			};

			await createFHIRResource(note);
			title = '';
			content = '';
			showPreview = false;
			onSave?.();
		} catch (err) {
			console.error('Failed to save note:', err);
			error = 'Failed to save note. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if error}
		<div class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
			{error}
		</div>
	{/if}

	<div>
		<label for="note-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Title
		</label>
		<input
			id="note-title"
			type="text"
			bind:value={title}
			placeholder="Note title..."
			required
			class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
		/>
	</div>

	<div>
		<div class="flex items-center justify-between mb-1">
			<label for="note-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Content
			</label>
			<button
				type="button"
				onclick={() => (showPreview = !showPreview)}
				class="text-xs text-primary hover:underline"
			>
				{showPreview ? 'Edit' : 'Preview'}
			</button>
		</div>
		{#if showPreview}
			<div
				class="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm prose dark:prose-invert max-w-none overflow-auto"
			>
				{#if content.trim()}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html simpleMarkdownToHtml(content)}
				{:else}
					<span class="text-gray-400 dark:text-gray-500">Nothing to preview</span>
				{/if}
			</div>
		{:else}
			<textarea
				id="note-content"
				bind:value={content}
				rows={6}
				placeholder="Write your note in markdown..."
				required
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			></textarea>
		{/if}
		<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
			Supports **bold**, *italic*, # headers, and - lists
		</p>
	</div>

	<div class="flex justify-end gap-2">
		<button
			type="button"
			onclick={onCancel}
			class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
		>
			Cancel
		</button>
		<button
			type="submit"
			disabled={submitting}
			class="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
		>
			{submitting ? 'Saving...' : 'Save Note'}
		</button>
	</div>
</form>
