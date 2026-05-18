<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import type { DashboardCardConfig, DashboardCardType } from '$lib/dashboard/patientDashboardConfig';

	interface Props {
		cards: DashboardCardConfig[];
		onReorder: (cards: DashboardCardConfig[]) => void;
		children?: import('svelte').Snippet<[DashboardCardType]>;
	}

	let { cards, onReorder, children }: Props = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let visibleCards = $state<Array<DashboardCardConfig & { id: string }>>([]);

	$effect(() => {
		visibleCards = cards
			.filter((c) => c.visible)
			.sort((a, b) => a.order - b.order)
			.map((c, i) => ({ ...c, id: `${c.type}-${i}` }));
	});

	function handleDndConsider(e: CustomEvent<{ items: Array<DashboardCardConfig & { id: string }> }>) {
		visibleCards = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<{ items: Array<DashboardCardConfig & { id: string }> }>) {
		visibleCards = e.detail.items;
		const reordered = e.detail.items.map((item, index) => ({
			type: item.type,
			title: item.title,
			visible: item.visible,
			order: index
		}));
		onReorder(reordered);
	}
</script>

<div
	class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
	use:dndzone={{ items: visibleCards, flipDurationMs: 300 }}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#each visibleCards as item (item.id)}
		<div animate:flip={{ duration: 300 }} class="relative group">
			<div
				class="absolute -top-2 -left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700"
			>
				<svg
					class="w-4 h-4 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8h16M4 16h16"
					/>
				</svg>
			</div>
			{@render children?.(item.type)}
		</div>
	{/each}
</div>
