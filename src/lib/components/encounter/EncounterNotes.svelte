<script lang="ts">
	import type { DocumentReference, Bundle } from 'fhir/r4b';
	import { getFHIRResources, createFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDateTime } from '$lib/utils';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import AIScribeButton from '$lib/components/ai/AIScribeButton.svelte';

	interface Props {
		encounterId: string;
		patientId: string;
		patientName?: string;
	}

	let { encounterId, patientId, patientName }: Props = $props();

	let noteContent = $state('');
	let saving = $state(false);
	let error = $state('');

	const notesState = createServiceState<Bundle>(async () => {
		return getFHIRResources('DocumentReference', {
			encounter: `Encounter/${encounterId}`,
			type: 'http://loinc.org|11506-3',
			_sort: '-date'
		});
	});

	$effect(() => {
		if (encounterId) {
			notesState.reload();
		}
	});

	function applyFormat(tag: string) {
		const textarea = document.getElementById('note-editor') as HTMLTextAreaElement;
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = noteContent.slice(start, end);
		const before = noteContent.slice(0, start);
		const after = noteContent.slice(end);
		let wrapped = '';
		switch (tag) {
			case 'bold': wrapped = `**${selected}**`; break;
			case 'italic': wrapped = `_${selected}_`; break;
			case 'heading': wrapped = `\n### ${selected}\n`; break;
			case 'list': wrapped = selected.split('\n').map((l) => `- ${l}`).join('\n'); break;
		}
		noteContent = before + wrapped + after;
		// restore focus after tick
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(start + wrapped.length, start + wrapped.length);
		});
	}

	async function saveNote() {
		if (!noteContent.trim()) return;
		saving = true;
		error = '';
		try {
			const doc: DocumentReference = {
				resourceType: 'DocumentReference',
				status: 'current',
				type: {
					coding: [{ system: 'http://loinc.org', code: '11506-3', display: 'Progress Note' }],
					text: 'Encounter Note'
				},
				subject: { reference: `Patient/${patientId}`, display: patientName },
				context: {
					encounter: [{ reference: `Encounter/${encounterId}` }]
				},
				date: new Date().toISOString(),
				content: [
					{
						attachment: {
							contentType: 'text/markdown',
							title: 'Encounter Note',
							data: btoa(noteContent)
						}
					}
				],
				description: `Encounter note for ${patientName || patientId}`
			};
			await createFHIRResource(doc);
			noteContent = '';
			notesState.reload();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save note';
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold">Encounter Notes</h3>
		<AIScribeButton />
	</div>

	<div class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
		<div class="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
			<button onclick={() => applyFormat('bold')} class="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Bold">B</button>
			<button onclick={() => applyFormat('italic')} class="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded italic" title="Italic">I</button>
			<button onclick={() => applyFormat('heading')} class="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded font-bold" title="Heading">H</button>
			<button onclick={() => applyFormat('list')} class="px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="List">• List</button>
		</div>
		<textarea
			id="note-editor"
			value={noteContent}
			oninput={(e) => (noteContent = e.currentTarget.value)}
			rows={8}
			class="w-full p-3 resize-y focus:outline-none dark:bg-gray-800 dark:text-white"
			placeholder="Write encounter notes here..."
		></textarea>
	</div>

	{#if error}
		<div class="p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>
	{/if}

	<div class="flex justify-end">
		<button
			onclick={saveNote}
			disabled={!noteContent.trim() || saving}
			class="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
		>
			{#if saving}
				<Spinner />
			{/if}
			{saving ? 'Saving...' : 'Save Note'}
		</button>
	</div>

	<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
		<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Previous Notes</h4>
		<RenderRemoteData remoteData={notesState.data}>
			{#snippet children(data)}
				{@const bundle = data as Bundle}
				{@const notes = (bundle.entry?.map((e) => e.resource as DocumentReference).filter(Boolean) || []) as DocumentReference[]}
				{#if notes.length > 0}
					<div class="space-y-2 max-h-64 overflow-y-auto pr-1">
						{#each notes as note (note.id)}
							<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div class="flex items-center justify-between mb-1">
									<p class="text-sm font-medium">{note.type?.text || 'Note'}</p>
									<p class="text-xs text-gray-500">{note.date ? humanDateTime(note.date) : '-'}</p>
								</div>
								{#if note.content && note.content[0]?.attachment?.data}
									<p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{atob(note.content[0].attachment.data)}</p>
								{:else}
									<p class="text-sm text-gray-500 italic">No content</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<Empty message="No notes yet" />
				{/if}
			{/snippet}
		</RenderRemoteData>
	</div>
</div>
