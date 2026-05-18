<script lang="ts">
	import ColumnFilterDropdown from './ColumnFilterDropdown.svelte';

	interface ColumnConfig {
		key: string;
		header: string;
		cell?: (row: unknown) => string;
		component?: any;
		componentProps?: (row: unknown) => Record<string, any>;
		filter?: {
			type: 'text' | 'select';
			options?: Array<{ value: string; label: string }>;
			placeholder?: string;
		};
		sortable?: boolean;
	}

	interface Props {
		data: unknown[];
		columns: ColumnConfig[];
		pageSize?: number;
		getRowId?: (row: unknown) => string;
		selectedIds?: string[];
		onToggleSelect?: (id: string) => void;
		onSelectAll?: () => void;
		onSelectNone?: () => void;
		viewMode?: 'table' | 'cards';
		bordered?: boolean;
		loading?: boolean;
		sortKey?: string | null;
		sortDirection?: 'asc' | 'desc';
		onSort?: (key: string) => void;
		onColumnFilterChange?: (key: string, value: string) => void;
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
		viewMode = 'table',
		bordered = false,
		loading = false,
		sortKey = null,
		sortDirection = 'asc',
		onSort,
		onColumnFilterChange
	}: Props = $props();

	let currentPage = $state(1);
	let columnFilterValues = $state<Record<string, string>>({});

	const totalPages = $derived(Math.ceil(data.length / pageSize));
	const paginatedData = $derived(data.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	const allPageSelected = $derived(() => {
		if (!getRowId || paginatedData.length === 0) return false;
		return paginatedData.every((row) => selectedIds.includes(getRowId(row)));
	});

	const somePageSelected = $derived(() => {
		if (!getRowId || paginatedData.length === 0) return false;
		return paginatedData.some((row) => selectedIds.includes(getRowId(row))) && !allPageSelected();
	});

	function handleColumnFilterChange(key: string, value: string) {
		columnFilterValues = { ...columnFilterValues, [key]: value };
		onColumnFilterChange?.(key, value);
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

<div class="relative">
	{#if viewMode === 'table'}
<div class="overflow-x-auto {bordered ? 'rounded-lg border border-[var(--gray-4)]' : ''}">
	<table class="w-full text-sm">
		<thead class="text-xs uppercase bg-[var(--gray-3)] text-[var(--gray-9)] {bordered ? '' : 'border-b border-[var(--gray-4)]'}">
			<tr>
				{#if getRowId}
					<th class="px-4 py-3 w-10 {bordered ? 'border border-[var(--gray-4)]' : ''}">
						<input
							type="checkbox"
							checked={allPageSelected()}
							indeterminate={somePageSelected()}
							onchange={handleHeaderCheckboxChange}
							class="w-4 h-4 accent-[var(--theme-primary)] text-primary bg-[var(--gray-2)] border-[var(--gray-5)] rounded focus:ring-[var(--theme-primary)] dark:focus:ring-[var(--theme-primary)] dark:ring-offset-[var(--gray-3)] dark:bg-[var(--gray-3)] dark:border-[var(--gray-5)]"
						/>
					</th>
				{/if}
				{#each columns as col}
					{@const isSortable = onSort && col.sortable !== false}
					<th
						class="px-6 py-3 {isSortable ? 'cursor-pointer select-none' : ''} {bordered ? 'border border-[var(--gray-4)]' : ''} {isSortable ? 'focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none' : ''}"
						onclick={() => isSortable ? onSort(col.key) : undefined}
						tabindex={isSortable ? 0 : undefined}
						role={isSortable ? 'button' : undefined}
						aria-label={isSortable ? `Sort by ${col.header}` : undefined}
						onkeydown={(e) => {
							if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
								e.preventDefault();
								onSort(col.key);
							}
						}}
					>
						<div class="flex items-center gap-1">
							{col.header}
							{#if sortKey === col.key}
								<span class="ml-1 text-[var(--theme-primary)]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</div>
						{#if col.filter}
							<ColumnFilterDropdown
								filter={col.filter}
								value={columnFilterValues[col.key] ?? ''}
								onChange={(value) => handleColumnFilterChange(col.key, value)}
							/>
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="text-[var(--gray-10)]">
			{#each paginatedData as row}
				{@const rowId = getRowId ? getRowId(row) : undefined}
				{@const isSelected = rowId ? selectedIds.includes(rowId) : false}
				<tr class="bg-[var(--gray-1)] dark:bg-[var(--gray-3)] {bordered ? '' : 'border-b border-[var(--gray-4)]'} hover:bg-[var(--gray-3)] dark:hover:bg-[var(--gray-6)] transition-colors">
					{#if getRowId && rowId}
						<td class="px-4 py-4 w-10 {bordered ? 'border border-[var(--gray-4)]' : ''}">
							<input
								type="checkbox"
								checked={isSelected}
								onchange={() => handleRowCheckbox(rowId)}
								class="w-4 h-4 accent-[var(--theme-primary)] text-primary bg-[var(--gray-2)] border-[var(--gray-5)] rounded focus:ring-[var(--theme-primary)] dark:focus:ring-[var(--theme-primary)] dark:ring-offset-[var(--gray-3)] dark:bg-[var(--gray-3)] dark:border-[var(--gray-5)]"
							/>
						</td>
					{/if}
					{#each columns as col}
								{@const CellComponent = col.component}
								<td class="px-6 py-4 {bordered ? 'border border-[var(--gray-4)]' : ''}">
									{#if CellComponent}
										<CellComponent {...(col.componentProps?.(row) ?? {})} />
									{:else if col.cell && col.cell(row).startsWith('<')}
										<div class="[&_a]:text-[var(--theme-primary)] [&_a]:hover:underline">
											{@html col.cell(row)}
										</div>
									{:else}
										{col.cell?.(row) ?? ''}
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
		<div class="bg-[var(--gray-1)] dark:bg-[var(--gray-3)] rounded-lg border border-[var(--gray-4)] dark:border-[var(--gray-5)] p-4 hover:shadow-md transition-shadow">
			<div class="flex items-center justify-between mb-3">
				{#if getRowId && rowId}
					<input
						type="checkbox"
						checked={isSelected}
						onchange={() => handleRowCheckbox(rowId)}
						class="w-4 h-4 accent-[var(--theme-primary)] text-primary bg-[var(--gray-2)] border-[var(--gray-5)] rounded focus:ring-[var(--theme-primary)] dark:focus:ring-[var(--theme-primary)] dark:ring-offset-[var(--gray-3)] dark:bg-[var(--gray-3)] dark:border-[var(--gray-5)]"
					/>
				{/if}
			</div>
			{#each columns as col}
							{@const CellComponent = col.component}
							<div class="mb-2 last:mb-0">
								<div class="text-xs text-[var(--gray-7)] uppercase tracking-wide">{col.header}</div>
								<div class="text-sm text-[var(--gray-10)] font-medium">
									{#if CellComponent}
										<CellComponent {...(col.componentProps?.(row) ?? {})} />
									{:else if col.cell && col.cell(row).startsWith('<')}
										<div class="[&_a]:text-[var(--theme-primary)] [&_a]:hover:underline">
											{@html col.cell(row)}
										</div>
									{:else}
										{col.cell?.(row) ?? ''}
									{/if}
								</div>
							</div>
			{/each}
		</div>
	{/each}
</div>
{/if}

{#if loading}
	<div class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10">
		<div class="animate-spin h-8 w-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full"></div>
	</div>
{/if}
</div>

{#if totalPages > 1}
	<div class="flex items-center justify-between p-4">
		<button
			onclick={() => currentPage = Math.max(1, currentPage - 1)}
			disabled={currentPage <= 1}
			class="px-3 py-1 text-sm bg-[var(--gray-2)] dark:bg-[var(--gray-3)] text-[var(--gray-10)] border border-[var(--gray-4)] dark:border-[var(--gray-5)] rounded disabled:opacity-50 focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none"
		>
			Previous
		</button>
		<span class="text-sm text-[var(--gray-8)]">
			Page {currentPage} of {totalPages}
		</span>
		<button
			onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
			disabled={currentPage >= totalPages}
			class="px-3 py-1 text-sm bg-[var(--gray-2)] dark:bg-[var(--gray-3)] text-[var(--gray-10)] border border-[var(--gray-4)] dark:border-[var(--gray-5)] rounded disabled:opacity-50 focus:ring-2 focus:ring-[var(--theme-primary)] focus:outline-none"
		>
			Next
		</button>
	</div>
{/if}
