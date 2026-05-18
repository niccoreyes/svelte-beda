<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4b';

	interface Props {
		items: QuestionnaireItem[];
		selectedLinkId: string | null;
		onSelect: (linkId: string) => void;
	}

	let { items, selectedLinkId, onSelect }: Props = $props();

	function renderTree(list: QuestionnaireItem[], depth = 0): Array<{ item: QuestionnaireItem; depth: number }> {
		const result: Array<{ item: QuestionnaireItem; depth: number }> = [];
		for (const item of list) {
			result.push({ item, depth });
			if (item.item && item.item.length > 0) {
				result.push(...renderTree(item.item, depth + 1));
			}
		}
		return result;
	}

	const flatTree = $derived(renderTree(items));
</script>

<div class="w-56 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 overflow-y-auto h-full">
	<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
		Navigation
	</h3>
	{#if flatTree.length === 0}
		<p class="text-xs text-gray-400">No items yet</p>
	{:else}
		<div class="space-y-0.5">
			{#each flatTree as { item, depth } (item.linkId)}
				<button
					onclick={() => onSelect(item.linkId)}
					class="w-full text-left text-sm rounded px-2 py-1.5 transition-colors {selectedLinkId === item.linkId
						? 'bg-primary/10 text-primary font-medium'
						: 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}"
					style="padding-left: {depth * 12 + 8}px"
				>
					<span class="truncate block">{item.text || item.linkId}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
