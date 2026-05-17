<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import type { QuestionnaireItem } from 'fhir/r4b';
	import { Modal } from '$lib/components';

	interface Props {
		open: boolean;
		groupItem: QuestionnaireItem | null;
		onClose: () => void;
		onSave: (updatedItem: QuestionnaireItem) => void;
	}

	let { open, groupItem, onClose, onSave }: Props = $props();

	let localItem = $state<QuestionnaireItem | null>(null);
	let childItems = $state<QuestionnaireItem[]>([]);

	interface DragChild extends QuestionnaireItem {
		id: string;
	}

	function wrapChildren(list: QuestionnaireItem[]): DragChild[] {
		return list.map((c, idx) => ({ ...c, id: `${c.linkId}-${idx}` }));
	}

	let dragChildren = $state<DragChild[]>([]);

	$effect(() => {
		if (groupItem) {
			localItem = { ...groupItem };
			childItems = groupItem.item ? [...groupItem.item] : [];
			dragChildren = wrapChildren(childItems);
		}
	});

	function handleConsider(e: CustomEvent<{ items: DragChild[] }>) {
		dragChildren = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<{ items: DragChild[] }>) {
		dragChildren = e.detail.items;
		childItems = e.detail.items.map(({ id, ...rest }) => rest as QuestionnaireItem);
	}

	function addChild(type: string) {
		const linkId = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const labels: Record<string, string> = {
			string: 'Text',
			integer: 'Integer',
			decimal: 'Decimal',
			date: 'Date',
			dateTime: 'Date & Time',
			boolean: 'Yes/No',
			choice: 'Choice',
			'display': 'Display'
		};
		const newChild: QuestionnaireItem = {
			linkId,
			type: type as QuestionnaireItem['type'],
			text: `New ${labels[type] ?? type}`
		};
		childItems = [...childItems, newChild];
		dragChildren = wrapChildren(childItems);
	}

	function removeChild(linkId: string) {
		childItems = childItems.filter((c) => c.linkId !== linkId);
		dragChildren = wrapChildren(childItems);
	}

	function handleSave() {
		if (!localItem) return;
		onSave({ ...localItem, item: childItems.length > 0 ? childItems : undefined });
		onClose();
	}

	const childTypes = ['string', 'integer', 'decimal', 'date', 'dateTime', 'boolean', 'choice', 'display'];
</script>

<Modal {open} title="Edit Group: {groupItem?.text || groupItem?.linkId || ''}" onClose={onClose}>
	<div class="space-y-4">
		<div>
			<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Group Text</label>
			<input
				type="text"
				value={localItem?.text || ''}
				oninput={(e) => {
					if (localItem) localItem = { ...localItem, text: e.currentTarget.value };
				}}
				class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="group-required"
				checked={localItem?.required || false}
				onchange={(e) => {
					if (localItem) localItem = { ...localItem, required: e.currentTarget.checked };
				}}
				class="rounded border-gray-300 text-primary focus:ring-primary"
			/>
			<label for="group-required" class="text-sm text-gray-700 dark:text-gray-300">Required</label>
		</div>

		<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
			<div class="flex items-center justify-between mb-2">
				<h4 class="text-sm font-medium text-gray-900 dark:text-white">Group Items</h4>
				<div class="flex gap-1">
					{#each childTypes as ct}
						<button
							onclick={() => addChild(ct)}
							class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
						>
							+ {ct}
						</button>
					{/each}
				</div>
			</div>

			{#if childItems.length === 0}
				<p class="text-sm text-gray-400 text-center py-4">No items in this group</p>
			{:else}
				<div
					class="space-y-2"
					use:dndzone={{ items: dragChildren, flipDurationMs: 200 }}
					onconsider={handleConsider}
					onfinalize={handleFinalize}
				>
					{#each dragChildren as child (child.id)}
						<div class="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
							<div class="flex items-center gap-2">
								<svg class="w-4 h-4 text-gray-400 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
								</svg>
								<div>
									<p class="text-sm">{child.text || '(no text)'}</p>
									<p class="text-xs text-gray-500">{child.type}</p>
								</div>
							</div>
							<button
								onclick={() => removeChild(child.linkId)}
								class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex gap-2 pt-2">
			<button
				onclick={handleSave}
				class="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:opacity-90"
			>
				Save Group
			</button>
			<button
				onclick={onClose}
				class="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
			>
				Cancel
			</button>
		</div>
	</div>
</Modal>
