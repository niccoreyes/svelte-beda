<script lang="ts">
	interface Props {
		open?: boolean;
		title?: string;
		children?: import('svelte').Snippet;
		onClose?: () => void;
	}

	let { open = false, title, children, onClose }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
		<button class="absolute inset-0 bg-black/50" onclick={onClose} aria-label="Close modal"></button>
		<div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
			{#if title}
				<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
					<button onclick={onClose} class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}
			<div class="p-4">
				{#key open}
					{@render children?.()}
				{/key}
			</div>
		</div>
	</div>
{/if}
