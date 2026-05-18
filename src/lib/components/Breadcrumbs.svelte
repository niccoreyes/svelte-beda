<script lang="ts">
	interface Props {
		crumbs: Array<{ label: string; href: string }>;
	}

	let { crumbs }: Props = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	{#each crumbs as crumb, i (crumb.href)}
		{#if i > 0}
			<span class="separator">/</span>
		{/if}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={crumb.href} class="crumb-link" class:last={i === crumbs.length - 1}>
			{crumb.label}
		</a>
	{/each}
</nav>

<style>
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		line-height: 22px;
		color: var(--gray-7);
		flex-wrap: wrap;
	}

	.separator {
		color: var(--gray-6);
	}

	.crumb-link {
		color: var(--gray-7);
		text-decoration: none;
		transition: color 0.2s;
	}

	.crumb-link:hover {
		color: var(--theme-primary);
	}

	.crumb-link.last {
		color: var(--gray-9);
		font-weight: 500;
		pointer-events: none;
	}

	:global(.dark) .crumb-link.last {
		color: var(--gray-9);
	}
</style>
