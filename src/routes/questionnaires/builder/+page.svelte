<script lang="ts">
	import type { Questionnaire, QuestionnaireItem } from 'fhir/r4b';
	import { PageContainer } from '$lib/components';
	import { remoteSave } from '$lib/fhir';
	import { notAsked, loading, success, type RemoteData } from '$lib/state';
	import { findItemByLinkId, flattenQuestionnaireItems } from '$lib/forms/itemTree';
	import { generateQuestionnaireFromText } from '$lib/ai/service';
	import { generateQuestionnaireFromPDF } from '$lib/ai/questionnaire-pdf';
	import ChangesDiff from '$lib/components/patient/ChangesDiff.svelte';
	import Builder from '$lib/forms/builder/Builder.svelte';
	import QuestionnaireItemSettings from '$lib/forms/builder/QuestionnaireItemSettings.svelte';
	import QuestionnaireSaveForm from '$lib/forms/builder/QuestionnaireSaveForm.svelte';
	import ModalQuestionnaireGroupItem from '$lib/forms/builder/ModalQuestionnaireGroupItem.svelte';
	import QuestionnaireSidebarNavigation from '$lib/forms/builder/QuestionnaireSidebarNavigation.svelte';

	interface HistoryEntry {
		id: string;
		prompt: string;
		result: string;
		timestamp: number;
	}

	let items = $state<QuestionnaireItem[]>([]);
	let selectedLinkId = $state<string | null>(null);
	let title = $state('');
	let status = $state('draft');
	let url = $state('');
	let aiPrompt = $state('');
	let aiLoading = $state(false);
	let showGroupModal = $state(false);
	let groupModalLinkId = $state<string | null>(null);
	let saveState = $state<RemoteData<Questionnaire, Error>>(notAsked());

	// History state
	let history = $state<HistoryEntry[]>([]);
	let showHistory = $state(false);
	let showDiff = $state(false);
	let diffOldEntry = $state<HistoryEntry | null>(null);
	let diffNewEntry = $state<HistoryEntry | null>(null);
	let pdfDragOver = $state(false);

	// Load history on mount
	$effect(() => {
		try {
			const raw = localStorage.getItem('beda_builder_history');
			if (raw) {
				history = JSON.parse(raw) as HistoryEntry[];
			}
		} catch {
			history = [];
		}
	});

	function saveHistoryToStorage(entries: HistoryEntry[]) {
		localStorage.setItem('beda_builder_history', JSON.stringify(entries));
	}

	function addHistoryEntry(prompt: string, questionnaire: Partial<Questionnaire>) {
		const entry: HistoryEntry = {
			id: crypto.randomUUID(),
			prompt,
			result: JSON.stringify(questionnaire, null, 2),
			timestamp: Date.now()
		};
		const updated = [entry, ...history];
		if (updated.length > 50) updated.pop();
		history = updated;
		saveHistoryToStorage(updated);
	}

	function restoreHistoryEntry(entry: HistoryEntry) {
		try {
			const parsed = JSON.parse(entry.result) as Partial<Questionnaire>;
			if (parsed.item) {
				items = parsed.item as QuestionnaireItem[];
			}
			if (parsed.title) title = parsed.title;
			if (parsed.status) status = parsed.status as string;
			if (parsed.url) url = parsed.url || '';
		} catch {
			alert('Failed to restore history entry');
		}
	}

	function deleteHistoryEntry(id: string) {
		const updated = history.filter((h) => h.id !== id);
		history = updated;
		saveHistoryToStorage(updated);
	}

	function openDiff(oldEntry: HistoryEntry, newEntry: HistoryEntry) {
		diffOldEntry = oldEntry;
		diffNewEntry = newEntry;
		showDiff = true;
	}

	const selectedItem = $derived(findItemByLinkId(items, selectedLinkId || '') || null);
	const allFlatItems = $derived(flattenQuestionnaireItems(items));

	function updateItemInTree(
		list: QuestionnaireItem[],
		linkId: string,
		updater: (item: QuestionnaireItem) => QuestionnaireItem
	): QuestionnaireItem[] {
		return list.map((item) => {
			if (item.linkId === linkId) {
				return updater(item);
			}
			if (item.item) {
				return { ...item, item: updateItemInTree(item.item, linkId, updater) };
			}
			return item;
		});
	}

	function deleteItemFromTree(list: QuestionnaireItem[], linkId: string): QuestionnaireItem[] {
		return list
			.filter((item) => item.linkId !== linkId)
			.map((item) => (item.item ? { ...item, item: deleteItemFromTree(item.item, linkId) } : item));
	}

	function handleItemsUpdate(newItems: QuestionnaireItem[]) {
		items = newItems;
	}

	function handleItemUpdate(updatedItem: QuestionnaireItem) {
		items = updateItemInTree(items, updatedItem.linkId, () => updatedItem);
	}

	function handleDeleteItem(linkId: string) {
		items = deleteItemFromTree(items, linkId);
		if (selectedLinkId === linkId) selectedLinkId = null;
	}

	function handleEditGroup(linkId: string) {
		groupModalLinkId = linkId;
		showGroupModal = true;
	}

	function handleSaveGroup(updatedGroup: QuestionnaireItem) {
		items = updateItemInTree(items, updatedGroup.linkId, () => updatedGroup);
		showGroupModal = false;
		groupModalLinkId = null;
	}

	function handleSaveField(field: 'title' | 'status' | 'url', value: string) {
		if (field === 'title') title = value;
		if (field === 'status') status = value;
		if (field === 'url') url = value;
	}

	async function handleSave() {
		saveState = loading();
		const questionnaire: Questionnaire = {
			resourceType: 'Questionnaire',
			status: status as Questionnaire['status'],
			title,
			url: url || undefined,
			item: items.length > 0 ? items : undefined
		};
		const result = await remoteSave(questionnaire);
		if (result.status === 'success') {
			saveState = success(result.data);
		} else if (result.status === 'failure') {
			saveState = { status: 'failure', error: result.error ?? new Error('Save failed') };
		}
	}

	async function handlePublish() {
		status = 'active';
		await handleSave();
	}

	async function handleGenerate() {
		if (!aiPrompt.trim()) return;
		aiLoading = true;
		try {
			const result = await generateQuestionnaireFromText(aiPrompt);
			const generated = result.questionnaire;
			applyGeneratedQuestionnaire(generated);
			addHistoryEntry(aiPrompt, generated);
			aiPrompt = '';
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Generation failed');
		} finally {
			aiLoading = false;
		}
	}

	function applyGeneratedQuestionnaire(generated: Partial<Questionnaire>) {
		if (generated.item) {
			items = generated.item as QuestionnaireItem[];
		}
		if (generated.title) title = generated.title;
		if (generated.status) status = generated.status as string;
		if (generated.url) url = generated.url || '';
	}

	async function handlePDFDrop(event: DragEvent) {
		event.preventDefault();
		pdfDragOver = false;
		const file = event.dataTransfer?.files?.[0];
		if (file && file.type === 'application/pdf') {
			await processPDFFile(file);
		}
	}

	async function handlePDFSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			await processPDFFile(file);
		}
	}

	async function processPDFFile(file: File) {
		aiLoading = true;
		try {
			const result = await generateQuestionnaireFromPDF(file);
			const generated = result.questionnaire;
			applyGeneratedQuestionnaire(generated);
			addHistoryEntry(`PDF: ${file.name}`, generated);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'PDF generation failed');
		} finally {
			aiLoading = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		pdfDragOver = true;
	}

	function handleDragLeave() {
		pdfDragOver = false;
	}

	function formatTimestamp(ts: number): string {
		return new Date(ts).toLocaleString();
	}

	const groupModalItem = $derived(findItemByLinkId(items, groupModalLinkId || '') || null);
</script>

<PageContainer title="Questionnaire Builder" variant="default">
	{#snippet titleRightElement()}
		<div class="flex items-center gap-2">
			{#if saveState.status === 'success'}
				<span class="text-xs text-green-600">Saved!</span>
			{:else if saveState.status === 'failure'}
				<span class="text-xs text-red-500">Save failed</span>
			{/if}
		</div>
	{/snippet}

	<div class="flex flex-col lg:flex-row gap-4 h-[calc(100vh-240px)] min-h-[500px]">
		<!-- Sidebar Navigation -->
		<div class="hidden lg:block h-full">
			<QuestionnaireSidebarNavigation
				{items}
				{selectedLinkId}
				onSelect={(linkId) => (selectedLinkId = linkId)}
			/>
		</div>

		<!-- Main Builder Area -->
		<div class="flex-1 flex flex-col min-w-0 h-full">
			<!-- AI Generation Panel -->
			<div class="mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">AI Generate</span>
					{#if history.length > 0}
						<button
							type="button"
							onclick={() => (showHistory = !showHistory)}
							class="ml-auto text-xs text-primary hover:underline"
						>
							{showHistory ? 'Hide' : 'Show'} History ({history.length})
						</button>
					{/if}
				</div>
				<div class="flex gap-2 mt-2">
					<input
						type="text"
						value={aiPrompt}
						oninput={(e) => (aiPrompt = e.currentTarget.value)}
						placeholder="Describe the questionnaire you want to generate..."
						class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					/>
					<button
						onclick={handleGenerate}
						disabled={aiLoading || !aiPrompt.trim()}
						class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
					>
						{aiLoading ? 'Generating...' : 'Generate'}
					</button>
				</div>

				<!-- PDF Drop Zone -->
				<div
					class="mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors {pdfDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'}"
					ondrop={handlePDFDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					role="button"
					tabindex="0"
					aria-label="Drop PDF file here"
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('pdf-upload')?.click(); }}
				>
					<input
						id="pdf-upload"
						type="file"
						accept="application/pdf"
						onchange={handlePDFSelect}
						class="hidden"
					/>
					<svg class="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						Drop a PDF here or <button type="button" onclick={() => document.getElementById('pdf-upload')?.click()} class="text-primary hover:underline">click to upload</button>
					</p>
				</div>
			</div>

			<!-- History Panel -->
			{#if showHistory}
				<div class="mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 max-h-64 overflow-y-auto">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Generation History</h3>
						<button
							type="button"
							onclick={() => (showHistory = false)}
							class="text-xs text-gray-500 hover:text-gray-700"
						>
							Close
						</button>
					</div>
					{#if history.length === 0}
						<p class="text-xs text-gray-500">No history yet.</p>
					{:else}
						<div class="space-y-2">
							{#each history as entry, index (entry.id)}
								<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
									<div class="min-w-0 flex-1 mr-2">
										<p class="truncate text-xs text-gray-700 dark:text-gray-300" title={entry.prompt}>
											{entry.prompt}
										</p>
										<p class="text-[10px] text-gray-400">{formatTimestamp(entry.timestamp)}</p>
									</div>
									<div class="flex items-center gap-1 shrink-0">
										<button
											type="button"
											onclick={() => restoreHistoryEntry(entry)}
											class="px-2 py-1 text-xs bg-primary text-white rounded hover:opacity-90"
										>
											Restore
										</button>
										{#if index < history.length - 1}
											<button
												type="button"
													onclick={() => openDiff(history[index + 1]!, entry)}
												class="px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
											>
												Diff
											</button>
										{/if}
										<button
											type="button"
											onclick={() => deleteHistoryEntry(entry.id)}
											class="p-1 text-gray-400 hover:text-red-500"
											aria-label="Delete history entry"
										>
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Builder Canvas -->
			<div class="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<Builder
					{items}
					{selectedLinkId}
					onSelect={(linkId) => (selectedLinkId = linkId)}
					onUpdate={handleItemsUpdate}
					onEditGroup={handleEditGroup}
				/>
			</div>
		</div>

		<!-- Right Panel: Settings + Save -->
		<div class="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto h-full">
			<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
				<QuestionnaireItemSettings
					item={selectedItem}
					allItems={allFlatItems}
					onUpdate={handleItemUpdate}
					onDelete={handleDeleteItem}
				/>
			</div>
			<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
				<QuestionnaireSaveForm
					{title}
					{status}
					{url}
					onChange={handleSaveField}
					onSave={handleSave}
					onPublish={handlePublish}
					saving={saveState.status === 'loading'}
				/>
			</div>
		</div>
	</div>
</PageContainer>

<!-- Diff Modal -->
{#if showDiff && diffOldEntry && diffNewEntry}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
		<button
			class="absolute inset-0 bg-black/50"
			onclick={() => (showDiff = false)}
			aria-label="Close diff overlay"
		></button>
		<div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-4">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Questionnaire Diff</h3>
				<button
					type="button"
					onclick={() => (showDiff = false)}
					class="p-2 text-gray-500 hover:text-gray-700"
					aria-label="Close"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<ChangesDiff oldText={diffOldEntry.result} newText={diffNewEntry.result} mode="sideBySide" />
		</div>
	</div>
{/if}

<ModalQuestionnaireGroupItem
	open={showGroupModal}
	groupItem={groupModalItem}
	onClose={() => {
		showGroupModal = false;
		groupModalLinkId = null;
	}}
	onSave={handleSaveGroup}
/>
