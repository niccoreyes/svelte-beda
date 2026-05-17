<script lang="ts">
	interface Props {
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm?: () => void;
		onCancel?: () => void;
	}

	let {
		open = false,
		title = 'Confirm Action',
		message = 'Are you sure you want to proceed?',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onConfirm,
		onCancel
	}: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
		<button class="absolute inset-0 bg-black/50" onclick={() => onCancel?.()} aria-label="Close modal"></button>
		<div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
				<button onclick={() => onCancel?.()} class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="p-4">
				<p class="text-sm text-gray-600 dark:text-gray-400">{message}</p>
			</div>
			<div class="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => onCancel?.()}
					class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
				>
					{cancelLabel}
				</button>
				<button
					onclick={() => onConfirm?.()}
					class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
