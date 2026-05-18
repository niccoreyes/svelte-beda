<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		onTabChange?: (tabId: string) => void;
		children?: import('svelte').Snippet<[string]>;
	}

	let { tabs, activeTab, onTabChange, children }: Props = $props();

	// svelte-ignore state_referenced_locally (intentional initial-value-only; component owns its own tab state)
	let current = $state(activeTab || tabs[0]?.id || '');

	function switchTab(id: string) {
		current = id;
		onTabChange?.(id);
	}
</script>

<div class="tabs">
	<div class="tab-list" role="tablist">
		{#each tabs as tab}
			<button
				role="tab"
				aria-selected={current === tab.id}
				onclick={() => switchTab(tab.id)}
				class="tab-button"
				class:active={current === tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	{#if current}
		<div class="tab-content" role="tabpanel">
			{#key current}
				{@render children?.(current)}
			{/key}
		</div>
	{/if}
</div>

<style>
	.tabs {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.tab-list {
		display: flex;
		border-bottom: 1px solid var(--gray-4);
		gap: 4px;
	}

	.tab-button {
		padding: 10px 16px;
		font-size: 14px;
		font-weight: 500;
		color: var(--gray-7);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s;
		margin-bottom: -1px;
	}

	.tab-button:hover {
		color: var(--gray-9);
	}

	.tab-button.active {
		color: var(--bcp-6);
		border-bottom-color: var(--bcp-6);
	}

	.tab-content {
		padding: 16px 0;
	}
</style>
