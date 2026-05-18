<script lang="ts">
	import DashboardCard from '../DashboardCard.svelte';
	import type { DashboardConfig, DashboardWidgetConfig } from '$lib/dashboard/config';

	interface WidgetConfig {
		title: string;
		icon?: import('svelte').Snippet;
		extra?: import('svelte').Snippet;
		table?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	interface Props {
		widgets?: WidgetConfig[];
		config?: DashboardConfig;
		widget?: import('svelte').Snippet<[string, string]>;
	}

	let { widgets = [], config, widget: widgetSnippet }: Props = $props();

	let effectiveWidgets = $derived(
		config ? config.widgets.map((w: DashboardWidgetConfig) => ({ title: w.title })) : widgets
	);
</script>

<div class="dashboards-grid">
	{#each effectiveWidgets as widget, i (i)}
		{#if config && widgetSnippet}
			{@const cfg = config.widgets[i]}
			{#if cfg}
				<DashboardCard title={widget.title}>
					{@render widgetSnippet(cfg.type, cfg.title)}
				</DashboardCard>
			{/if}
		{:else}
			<DashboardCard title={widget.title} icon={widgets[i]?.icon} extra={widgets[i]?.extra} table={widgets[i]?.table}>
				{@render widgets[i]?.children?.()}
			</DashboardCard>
		{/if}
	{/each}
</div>

<style>
	.dashboards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 768px) {
		.dashboards-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.dashboards-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
