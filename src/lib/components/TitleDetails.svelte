<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		details?: string;
		children?: Snippet;
	}

	let { title, details = '', children }: Props = $props();
	let expanded = $state(false);
</script>

<div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
	<button
		type="button"
		onclick={() => (expanded = !expanded)}
		class="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
	>
		<span class="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</span>
		<svg
			class="w-4 h-4 text-gray-500 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>
	{#if expanded}
		<div class="px-3 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
			<div class="pt-2">
				{#if children}
					{@render children()}
				{:else}
					{details}
				{/if}
			</div>
		</div>
	{/if}
</div>
