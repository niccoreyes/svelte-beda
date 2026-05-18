<script lang="ts">
	import { resolve } from '$app/paths';

	export interface RecordAction {
		label: string;
		href?: string;
		onClick?: () => void;
		variant?: 'default' | 'danger';
	}

	let { actions } = $props<{ actions: RecordAction[] }>();
</script>

<span class="flex gap-x-3">
	{#each actions as action, i (i)}
		{#if action.href}
			<a href={resolve(action.href)} class="text-sm text-[var(--theme-primary)] hover:underline focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded">{action.label}</a>
		{:else if action.onClick}
			<button
				type="button"
				onclick={action.onClick}
				class="text-sm text-[var(--theme-primary)] hover:underline bg-transparent border-0 p-0 cursor-pointer focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none rounded"
			>
				{action.label}
			</button>
		{/if}
	{/each}
</span>
