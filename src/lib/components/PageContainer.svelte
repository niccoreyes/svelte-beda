<script lang="ts">
	interface Props {
		variant?: 'default' | 'with-table' | 'with-tabs';
		title?: string;
		titleLeftElement?: import('svelte').Snippet;
		titleRightElement?: import('svelte').Snippet;
		headerContent?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', title, titleLeftElement, titleRightElement, headerContent, children }: Props = $props();
</script>

<div class="page-wrapper">
	<div class="page-content">
		{#if title || titleLeftElement || titleRightElement || headerContent}
			<div class="header-container" class:with-table={variant === 'with-table'} class:with-tabs={variant === 'with-tabs'}>
				<div class="header-row">
					<div class="header-left">
						{#if titleLeftElement}
							{@render titleLeftElement()}
						{/if}
						{#if title}
							<h1 class="page-title">{title}</h1>
						{/if}
					</div>
					{#if titleRightElement}
						<div class="header-right">
							{@render titleRightElement()}
						</div>
					{/if}
				</div>
				{#if headerContent}
					<div class="header-extra">
						{@render headerContent()}
					</div>
				{/if}
			</div>
		{/if}

		<div class="content-container" class:with-table={variant === 'with-table'}>
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.page-wrapper {
		background-color: var(--gray-1);
		display: flex;
		justify-content: center;
		padding: 0 24px;
	}

	.page-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 40px 20px;
		gap: 40px 0;
		max-width: 1120px;
		width: 100%;
	}

	.header-container {
		background-color: var(--theme-sidebar-background);
		border-radius: 10px;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
		border: 1px solid var(--gray-4);
		padding: 24px 24px;
	}

	:global(.dark) .header-container {
		border-color: var(--gray-4);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1), 0 1px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
	}

	.header-container.with-table {
		padding-bottom: 79px;
	}

	.header-container.with-tabs {
		padding-bottom: 0;
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px 40px;
		position: relative;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0 8px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0 40px;
	}

	.page-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
	}

	:global(.dark) .page-title {
		color: var(--gray-10);
	}

	.header-extra {
		margin-top: 16px;
	}

	.content-container {
		background-color: var(--theme-sidebar-background);
		border-radius: 10px;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
		border: 1px solid var(--gray-4);
		padding: 24px;
	}

	:global(.dark) .content-container {
		border-color: var(--gray-4);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1), 0 1px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
	}

	.content-container.with-table {
		padding: 0;
		overflow: hidden;
	}

	.content-container.with-table :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.content-container.with-table :global(thead tr) {
		background-color: var(--gray-2);
	}

	:global(.dark) .content-container.with-table :global(thead tr) {
		background-color: var(--gray-2);
	}

	.content-container.with-table :global(th) {
		padding: 12px 24px;
		text-align: left;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-7);
		border-bottom: 1px solid var(--gray-4);
	}

	.content-container.with-table :global(td) {
		padding: 16px 24px;
		border-bottom: 1px solid var(--gray-4);
		color: var(--gray-9);
	}

	.content-container.with-table :global(tbody tr:hover) {
		background-color: var(--gray-1);
	}

	:global(.dark) .content-container.with-table :global(tbody tr:hover) {
		background-color: var(--gray-1);
	}

	@media screen and (max-width: 767px) {
		.page-content {
			padding: 20px 12px;
			gap: 24px 0;
		}

		.header-row {
			padding-right: 48px;
		}
	}
</style>
