<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		trigger?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		title?: string;
	}

	let { trigger, children, title }: Props = $props();
	let open = $state(false);
</script>

{#if trigger}
	<button onclick={() => (open = true)}>
		{@render trigger()}
	</button>
{:else}
	<button onclick={() => (open = true)} class="px-4 py-2 bg-primary text-white rounded-lg">
		Open
	</button>
{/if}

<Modal {open} {title} onClose={() => (open = false)}>
	{@render children?.()}
</Modal>
