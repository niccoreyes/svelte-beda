<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte';

	interface Props {
		title: string;
		icon?: import('svelte').Snippet;
		loading?: boolean;
		children?: import('svelte').Snippet;
	}

	let { title, icon, loading = false, children }: Props = $props();
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
	<div
		class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
	>
		{#if icon}
			{@render icon()}
		{:else}
			<svg
				class="w-5 h-5 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
		{/if}
		<h3 class="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
	</div>
	<div class="p-4">
		{#if loading}
			<Spinner />
		{:else}
			{@render children?.()}
		{/if}
	</div>
</div>
