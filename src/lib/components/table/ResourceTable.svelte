<script lang="ts">
	interface Props {
		data: unknown[];
		columns: Array<{ key: string; header: string; cell: (row: unknown) => string }>;
		pageSize?: number;
	}

	let { data, columns, pageSize = 10 }: Props = $props();

	let currentPage = $state(1);
	let sortKey = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	const sortedData = $derived(() => {
		if (!sortKey) return data;
		const col = columns.find((c) => c.key === sortKey);
		if (!col) return data;
		return [...data].sort((a, b) => {
			const aVal = col.cell(a);
			const bVal = col.cell(b);
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	});

	const totalPages = $derived(Math.ceil(data.length / pageSize));
	const paginatedData = $derived(sortedData().slice((currentPage - 1) * pageSize, currentPage * pageSize));

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
		<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
			<tr>
				{#each columns as col}
					<th class="px-6 py-3 cursor-pointer select-none" onclick={() => toggleSort(col.key)}>
						{col.header}
						{#if sortKey === col.key}
							<span class="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each paginatedData as row}
				<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
					{#each columns as col}
						<td class="px-6 py-4">
							{col.cell(row)}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if totalPages > 1}
	<div class="flex items-center justify-between p-4">
		<button
			onclick={() => currentPage = Math.max(1, currentPage - 1)}
			disabled={currentPage <= 1}
			class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
		>
			Previous
		</button>
		<span class="text-sm text-gray-600 dark:text-gray-400">
			Page {currentPage} of {totalPages}
		</span>
		<button
			onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
			disabled={currentPage >= totalPages}
			class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
		>
			Next
		</button>
	</div>
{/if}
