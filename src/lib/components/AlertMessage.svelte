<script lang="ts">
	interface Props {
		type?: 'info' | 'success' | 'warning' | 'error';
		title?: string;
		message: string;
		dismissible?: boolean;
	}

	let { type = 'info', title, message, dismissible = true }: Props = $props();

	let dismissed = $state(false);

	function dismiss() {
		dismissed = true;
	}

	const styles: Record<string, string> = {
		info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
		success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
		error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
	};

	const iconColors: Record<string, string> = {
		info: 'text-blue-500 dark:text-blue-300',
		success: 'text-green-500 dark:text-green-300',
		warning: 'text-yellow-500 dark:text-yellow-300',
		error: 'text-red-500 dark:text-red-300'
	};
</script>

{#if !dismissed}
	<div class="flex items-start gap-3 p-4 border rounded-lg {styles[type]}" role="alert">
		<div class="mt-0.5 flex-shrink-0 {iconColors[type]}">
			{#if type === 'info'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{:else if type === 'success'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{:else if type === 'warning'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>
		<div class="flex-1 min-w-0">
			{#if title}
				<h4 class="font-semibold text-sm">{title}</h4>
			{/if}
			<p class="text-sm mt-0.5">{message}</p>
		</div>
		{#if dismissible}
			<button onclick={dismiss} class="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5" aria-label="Dismiss alert">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
