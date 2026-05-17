<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props<T> {
		data: T[];
		renderCard: Snippet<[T]>;
	}

	let { data, renderCard }: Props<unknown> = $props();
</script>

<div class="space-y-4">
	{#each data as item}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
			{@render renderCard(item)}
		</div>
	{/each}
</div>
