<script lang="ts">
	import DashboardCard from '../DashboardCard.svelte';

	interface WidgetConfig {
		title: string;
		icon?: import('svelte').Snippet;
		extra?: import('svelte').Snippet;
		table?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	interface Props {
		widgets: WidgetConfig[];
	}

	let { widgets }: Props = $props();
</script>

<div class="dashboards-grid">
	{#each widgets as widget}
		<DashboardCard title={widget.title} icon={widget.icon} extra={widget.extra} table={widget.table}>
			{@render widget.children?.()}
		</DashboardCard>
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
