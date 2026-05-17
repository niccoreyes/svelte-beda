<script lang="ts">
	interface Props {
		data: unknown[];
		columns: Array<{ key: string; header: string; cell: (row: unknown) => string }>;
		pageSize?: number;
		getRowId?: (row: unknown) => string;
		selectedIds?: string[];
		onToggleSelect?: (id: string) => void;
		onSelectAll?: () => void;
		onSelectNone?: () => void;
		viewMode?: 'table' | 'cards';
	}

	let {
		data,
		columns,
		pageSize = 10,
		getRowId,
		selectedIds = [],
		onToggleSelect,
		onSelectAll,
		onSelectNone,
		viewMode = 'table'
	}: Props = $props();

	let currentPage = $state(1);
	let internalViewMode = $state<'table' | 'cards'>(viewMode);

	$effect(() => {
		internalViewMode = viewMode;
	});
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

	const allPageSelected = $derived(() => {
		if (!getRowId || paginatedData.length === 0) return false;
		return paginatedData.every((row) => selectedIds.includes(getRowId(row)));
	});

	const somePageSelected = $derived(() => {
		if (!getRowId || paginatedData.length === 0) return false;
		return paginatedData.some((row) => selectedIds.includes(getRowId(row))) && !allPageSelected();
	});

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function handleHeaderCheckboxChange() {
		if (allPageSelected()) {
			onSelectNone?.();
		} else {
			onSelectAll?.();
		}
	}

	function handleRowCheckbox(id: string) {
		onToggleSelect?.(id);
	}
</script>

<div class="flex items-center justify-end mb-2 gap-1">
	<button
		type="button"
		onclick={() => (internalViewMode = 'table')}
		class="p-1.5 rounded {internalViewMode === 'table' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}"
		aria-label="Table view"
		title="Table view"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
		</svg>
	</button>
	<button
		type="button"
		onclick={() => (internalViewMode = 'cards')}
		class="p-1.5 rounded {internalViewMode === 'cards' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}"
		aria-label="Cards view"
		title="Cards view"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
		</svg>
	</button>
</div>

{#if internalViewMode === 'table'}
<div class="overflow-x-auto">
	<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
		<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
			<tr>
				{#if getRowId}
					<th class="px-4 py-3 w-10">
						<input
							type="checkbox"
							checked={allPageSelected()}
							indeterminate={somePageSelected()}
							onchange={handleHeaderCheckboxChange}
							class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
						/>
					</th>
				{/if}
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
				{@const rowId = getRowId ? getRowId(row) : undefined}
				{@const isSelected = rowId ? selectedIds.includes(rowId) : false}
				<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
					{#if getRowId && rowId}
						<td class="px-4 py-4 w-10">
							<input
								type="checkbox"
								checked={isSelected}
								onchange={() => handleRowCheckbox(rowId)}
								class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
							/>
						</td>
					{/if}
					{#each columns as col}
								<td class="px-6 py-4">
									{#if col.cell(row).startsWith('<')}
										{@html col.cell(row)}
									{:else}
										{col.cell(row)}
									{/if}
								</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
{:else}
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
	{#each paginatedData as row}
		{@const rowId = getRowId ? getRowId(row) : undefined}
		{@const isSelected = rowId ? selectedIds.includes(rowId) : false}
		<div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
			<div class="flex items-center justify-between mb-3">
				{#if getRowId && rowId}
					<input
						type="checkbox"
						checked={isSelected}
						onchange={() => handleRowCheckbox(rowId)}
						class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
					/>
				{/if}
			</div>
			{#each columns as col}
							<div class="mb-2 last:mb-0">
								<div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{col.header}</div>
								<div class="text-sm text-gray-800 dark:text-gray-200 font-medium">
									{#if col.cell(row).startsWith('<')}
										{@html col.cell(row)}
									{:else}
										{col.cell(row)}
									{/if}
								</div>
							</div>
			{/each}
		</div>
	{/each}
</div>
{/if}

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
