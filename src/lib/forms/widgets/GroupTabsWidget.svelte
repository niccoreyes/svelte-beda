<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4b';
	import type { Snippet } from 'svelte';

	interface Props {
		item: QuestionnaireItem;
		items: QuestionnaireItem[];
		renderItem: (item: QuestionnaireItem) => ReturnType<Snippet>;
	}

	let { item, items, renderItem }: Props = $props();
	// svelte-ignore state_referenced_locally (intentional initial-value-only; component manages its own active tab)
	let activeTab = $state<string>(items[0]?.linkId || '');

	const tabs = $derived(
		items.map((child) => ({
			linkId: child.linkId,
			label: child.text || child.linkId
		}))
	);
</script>

<div class="form-field">
	{#if item.text}
		<label class="block text-sm font-medium mb-2">
			{item.text}
			{#if item.required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}
	<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
		<div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
			{#each tabs as tab (tab.linkId)}
				<button
					type="button"
					onclick={() => (activeTab = tab.linkId)}
					class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors {activeTab === tab.linkId ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>
		<div class="p-4">
			{#each items as childItem (childItem.linkId)}
				{#if childItem.linkId === activeTab}
					{@render renderItem(childItem)}
				{/if}
			{/each}
		</div>
	</div>
</div>
