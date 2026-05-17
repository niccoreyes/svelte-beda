<script lang="ts">
	interface Props {
		count: number;
		onFinish?: () => void;
		onDelete?: () => void;
		onExport?: () => void;
		canFinish?: boolean;
		canDelete?: boolean;
		canExport?: boolean;
	}

	let {
		count,
		onFinish,
		onDelete,
		onExport,
		canFinish = false,
		canDelete = false,
		canExport = true
	}: Props = $props();
</script>

{#if count > 0}
	<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
		<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
			{count} item{count === 1 ? '' : 's'} selected
		</span>
		<div class="flex gap-2">
			{#if canFinish}
				<button
					onclick={() => onFinish?.()}
					class="px-3 py-1.5 text-sm bg-primary text-white rounded hover:opacity-90 transition-opacity"
				>
					Finish Encounters
				</button>
			{/if}
			{#if canDelete}
				<button
					onclick={() => onDelete?.()}
					class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
				>
					Delete
				</button>
			{/if}
			{#if canExport}
				<button
					onclick={() => onExport?.()}
					class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					Export CSV
				</button>
			{/if}
		</div>
	</div>
{/if}
