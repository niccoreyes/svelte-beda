<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import type { QuestionnaireItem } from 'fhir/r4b';

	interface Props {
		items: QuestionnaireItem[];
		selectedLinkId: string | null;
		onSelect: (linkId: string | null) => void;
		onUpdate: (items: QuestionnaireItem[]) => void;
		onEditGroup: (linkId: string) => void;
	}

	let { items, selectedLinkId, onSelect, onUpdate, onEditGroup }: Props = $props();

	interface DragItem extends QuestionnaireItem {
		id: string;
	}

	function wrapItems(list: QuestionnaireItem[]): DragItem[] {
		return list.map((item, idx) => ({
			...item,
			id: `${item.linkId}-${idx}`
		}));
	}

	let dragItems = $state<DragItem[]>([]);

	$effect(() => {
		dragItems = wrapItems(items);
	});

	function handleConsider(e: CustomEvent<{ items: DragItem[] }>) {
		dragItems = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<{ items: DragItem[] }>) {
		dragItems = e.detail.items;
		const newItems = e.detail.items.map(({ id, ...rest }) => rest as QuestionnaireItem);
		onUpdate(newItems);
	}

	const palette = [
		{ type: 'string', label: 'Text', icon: 'T' },
		{ type: 'integer', label: 'Integer', icon: '123' },
		{ type: 'decimal', label: 'Decimal', icon: '1.2' },
		{ type: 'date', label: 'Date', icon: '📅' },
		{ type: 'dateTime', label: 'Date & Time', icon: '🕐' },
		{ type: 'boolean', label: 'Yes/No', icon: '☑' },
		{ type: 'choice', label: 'Choice', icon: '◉' },
		{ type: 'open-choice', label: 'Open Choice', icon: '◎' },
		{ type: 'reference', label: 'Reference', icon: '🔗' },
		{ type: 'quantity', label: 'Quantity', icon: '⚖' },
		{ type: 'attachment', label: 'Attachment', icon: '📎' },
		{ type: 'group', label: 'Group', icon: '⊞' },
		{ type: 'display', label: 'Display', icon: '📄' }
	];

	function addItem(type: string) {
		const linkId = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const newItem: QuestionnaireItem = {
			linkId,
			type: type as QuestionnaireItem['type'],
			text: `New ${palette.find((p) => p.type === type)?.label ?? type}`
		};
		onUpdate([...items, newItem]);
		onSelect(linkId);
	}

	function removeItem(linkId: string, e: Event) {
		e.stopPropagation();
		const newItems = items.filter((i) => i.linkId !== linkId);
		onUpdate(newItems);
		if (selectedLinkId === linkId) onSelect(null);
	}

	function moveItem(linkId: string, direction: 'up' | 'down', e: Event) {
		e.stopPropagation();
		const arr = [...items];
		const idx = arr.findIndex((i) => i.linkId === linkId);
		if (idx === -1) return;
		if (direction === 'up' && idx > 0) {
			const temp = arr[idx]!;
			arr[idx] = arr[idx - 1]!;
			arr[idx - 1] = temp;
		} else if (direction === 'down' && idx < arr.length - 1) {
			const temp = arr[idx]!;
			arr[idx] = arr[idx + 1]!;
			arr[idx + 1] = temp;
		}
		onUpdate(arr);
	}
</script>

<div class="flex h-full">
	<!-- Left Palette -->
	<div class="w-48 border-r border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 flex flex-col">
		<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
			Item Types
		</h3>
		<div class="space-y-1 overflow-y-auto flex-1">
			{#each palette as p}
				<button
					onclick={() => addItem(p.type)}
					class="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors flex items-center gap-2"
				>
					<span class="text-gray-400">{p.icon}</span>
					<span class="text-gray-700 dark:text-gray-300">{p.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Center Canvas -->
	<div class="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
		{#if items.length === 0}
			<div class="flex flex-col items-center justify-center h-64 text-gray-400">
				<p class="text-sm">Click an item type on the left to add questions</p>
			</div>
		{:else}
			<div
				class="space-y-2"
				use:dndzone={{ items: dragItems, flipDurationMs: 200 }}
				onconsider={handleConsider}
				onfinalize={handleFinalize}
				role="list"
				aria-label="Questionnaire items"
			>
				{#each dragItems as item (item.id)}
					<div
						class="border rounded-lg p-3 cursor-pointer transition-colors {selectedLinkId === item.linkId
							? 'border-primary bg-primary/5 dark:bg-primary/10'
							: 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
						onclick={() => onSelect(item.linkId)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item.linkId); } }}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 flex-1 min-w-0">
								<svg class="w-4 h-4 text-gray-400 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
								</svg>
								<div class="min-w-0">
									<p class="text-sm font-medium text-gray-900 dark:text-white truncate">
										{item.text || '(no text)'}
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										{item.type}{#if item.required}, required{/if}
									</p>
								</div>
							</div>
							<div class="flex items-center gap-1 ml-2">
								{#if item.type === 'group'}
									<button
										onclick={(e) => {
											e.stopPropagation();
											onEditGroup(item.linkId);
										}}
										class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
										title="Edit group contents"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
										</svg>
									</button>
								{/if}
								<button
									onclick={(e) => moveItem(item.linkId, 'up', e)}
									class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
									title="Move up"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
									</svg>
								</button>
								<button
									onclick={(e) => moveItem(item.linkId, 'down', e)}
									class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
									title="Move down"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								<button
									onclick={(e) => removeItem(item.linkId, e)}
									class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
									title="Remove"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
