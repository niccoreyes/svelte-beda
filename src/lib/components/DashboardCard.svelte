<script lang="ts">
	interface Props {
		title: string;
		icon?: import('svelte').Snippet;
		extra?: import('svelte').Snippet;
		table?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { title, icon, extra, table, children }: Props = $props();
</script>

<div class="dashboard-card">
	<div class="card-header">
		<div class="card-title-row">
			{#if icon}
				<div class="card-icon">
					{@render icon()}
				</div>
			{/if}
			<h3 class="card-title">{title}</h3>
		</div>
		{#if extra}
			<div class="card-extra">
				{@render extra()}
			</div>
		{/if}
	</div>

	{#if children}
		<div class="card-body">
			{@render children()}
		</div>
	{/if}

	{#if table}
		<div class="card-table">
			{@render table()}
		</div>
	{/if}
</div>

<style>
	.dashboard-card {
		background-color: var(--theme-sidebar-background);
		border-radius: 10px;
		border: 1px solid var(--gray-4);
		box-shadow:
			0 1px 2px 0 rgba(0, 0, 0, 0.03),
			0 1px 6px -1px rgba(0, 0, 0, 0.02),
			0 2px 4px 0 rgba(0, 0, 0, 0.02);
		overflow: hidden;
	}

	:global(.dark) .dashboard-card {
		border-color: var(--gray-4);
		box-shadow:
			0 1px 2px 0 rgba(0, 0, 0, 0.1),
			0 1px 6px -1px rgba(0, 0, 0, 0.08),
			0 2px 4px 0 rgba(0, 0, 0, 0.08);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--gray-4);
		gap: 12px;
	}

	.card-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--bcp-6);
		flex-shrink: 0;
	}

	.card-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(.dark) .card-title {
		color: var(--gray-10);
	}

	.card-extra {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.card-body {
		padding: 16px 20px;
	}

	.card-table {
		padding: 0;
		overflow-x: auto;
	}

	.card-table :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.card-table :global(thead tr) {
		background-color: var(--gray-2);
	}

	:global(.dark) .card-table :global(thead tr) {
		background-color: var(--gray-2);
	}

	.card-table :global(th) {
		padding: 12px 20px;
		text-align: left;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-7);
		border-bottom: 1px solid var(--gray-4);
	}

	.card-table :global(td) {
		padding: 12px 20px;
		border-bottom: 1px solid var(--gray-4);
		color: var(--gray-9);
	}

	.card-table :global(tbody tr:hover) {
		background-color: var(--gray-1);
	}

	:global(.dark) .card-table :global(tbody tr:hover) {
		background-color: var(--gray-1);
	}
</style>
