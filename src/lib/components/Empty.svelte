<script lang="ts">
	import EmptyStateIllustration from './EmptyStateIllustration.svelte';

	interface Props {
		message?: string;
		illustration?: 'search' | 'document' | 'patient' | 'calendar' | 'default';
	}

	let { message = 'No data available', illustration = 'default' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
	<EmptyStateIllustration type={illustration} />
	<p class="text-sm">{message}</p>
</div>
