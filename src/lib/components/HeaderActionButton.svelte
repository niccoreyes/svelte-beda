<script lang="ts">
	interface Props {
		label: string;
		onClick?: () => void;
		icon?: import('svelte').Snippet;
	}

	let { label, onClick, icon }: Props = $props();
</script>

<button
	onclick={onClick}
	class="inline-flex items-center gap-1.5 rounded-md bg-[var(--theme-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
>
	{#if icon}
		{@render icon()}
	{/if}
	<span>{label}</span>
</button>
