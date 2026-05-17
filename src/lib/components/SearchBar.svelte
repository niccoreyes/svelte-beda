<script module lang="ts">
	export type FilterType = 'STRING' | 'DATE' | 'SINGLEDATE' | 'REFERENCE' | 'CHOICE' | 'SOLIDCHOICE' | 'SPLITSTRING';

	export interface FilterOption {
		value: string;
		label: string;
	}

	export interface FilterConfig {
		id: string;
		label: string;
		type: FilterType;
		value?: string;
		resourceType?: string;
		options?: FilterOption[];
		delimiter?: string;
		placeholder?: string;
	}

	export function serializeFilters(filters: FilterConfig[]): Record<string, string | string[]> {
		const result: Record<string, string | string[]> = {};
		for (const filter of filters) {
			const serialized = serializeFilterValue(filter);
			if (serialized !== undefined) {
				result[filter.id] = serialized;
			}
		}
		return result;
	}

	export function serializeFilterValue(filter: FilterConfig): string | string[] | undefined {
		const { type, value, resourceType, delimiter } = filter;
		if (!value || value === '') return undefined;

		switch (type) {
			case 'STRING':
				return value;
			case 'DATE': {
				try {
					const parsed = JSON.parse(value) as { start?: string; end?: string };
					const parts: string[] = [];
					if (parsed.start) parts.push(`ge${parsed.start}`);
					if (parsed.end) parts.push(`le${parsed.end}`);
					return parts.length > 0 ? parts : undefined;
				} catch {
					return undefined;
				}
			}
			case 'SINGLEDATE':
				return `eq${value}`;
			case 'REFERENCE': {
				if (value.includes('/')) return value;
				return resourceType ? `${resourceType}/${value}` : value;
			}
			case 'CHOICE':
			case 'SOLIDCHOICE':
				return value;
			case 'SPLITSTRING': {
				const parts = value.split(delimiter || ',').map((v) => v.trim()).filter(Boolean);
				return parts.length > 0 ? parts : undefined;
			}
			default:
				return value;
		}
	}
</script>

<script lang="ts">
	interface Props {
		filters?: FilterConfig[];
		onFilterChange?: (id: string, value: string) => void;
		onClearFilters?: () => void;
	}

	let { filters = [], onFilterChange, onClearFilters }: Props = $props();
	let isMobile = $state(false);
	let mobileDrawerOpen = $state(false);
	let activeFilterCount = $derived(
		filters.filter((f) => {
			if (!f.value || f.value === '') return false;
			if (f.type === 'DATE') {
				try {
					const parsed = JSON.parse(f.value) as { start?: string; end?: string };
					return !!parsed.start || !!parsed.end;
				} catch {
					return false;
				}
			}
			return true;
		}).length
	);

	$effect(() => {
		const mql = window.matchMedia('(max-width: 767px)');
		isMobile = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	function handleDateChange(filter: FilterConfig, field: 'start' | 'end', newValue: string) {
		let parsed: { start?: string; end?: string } = {};
		try {
			if (filter.value) parsed = JSON.parse(filter.value);
		} catch {
			// ignore parse errors
		}
		if (newValue) {
			parsed[field] = newValue;
		} else {
			delete parsed[field];
		}
		const serialized = JSON.stringify(parsed);
		onFilterChange?.(filter.id, serialized === '{}' ? '' : serialized);
	}

	function getDateValue(filter: FilterConfig, field: 'start' | 'end'): string {
		if (!filter.value) return '';
		try {
			const parsed = JSON.parse(filter.value) as { start?: string; end?: string };
			return parsed[field] || '';
		} catch {
			return '';
		}
	}

	function handleInputChange(filterId: string, value: string) {
		onFilterChange?.(filterId, value);
	}
</script>

{#snippet filterInput(filter: FilterConfig)}
	{#if filter.type === 'STRING' || filter.type === 'REFERENCE' || filter.type === 'SPLITSTRING'}
		<div class="flex flex-col">
			<label for="{filter.id}-input" class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-input"
				type="text"
				value={filter.value || ''}
				oninput={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				placeholder={filter.placeholder || ''}
				class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>
	{:else if filter.type === 'SINGLEDATE'}
		<div class="flex flex-col">
			<label for="{filter.id}-input" class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-input"
				type="date"
				value={filter.value || ''}
				oninput={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>
	{:else if filter.type === 'DATE'}
		<div class="flex flex-col">
			<span class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<div class="flex space-x-2">
				<div class="flex flex-col">
					<label for="{filter.id}-start" class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">From</label>
					<input
						id="{filter.id}-start"
						type="date"
						value={getDateValue(filter, 'start')}
						oninput={(e) => handleDateChange(filter, 'start', e.currentTarget.value)}
						class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="flex flex-col">
					<label for="{filter.id}-end" class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">To</label>
					<input
						id="{filter.id}-end"
						type="date"
						value={getDateValue(filter, 'end')}
						oninput={(e) => handleDateChange(filter, 'end', e.currentTarget.value)}
						class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>
	{:else if filter.type === 'CHOICE'}
		<div class="flex flex-col">
			<label for="{filter.id}-input" class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<select
				id="{filter.id}-input"
				value={filter.value || ''}
				onchange={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700"
			>
				<option value="">-- Select --</option>
				{#each filter.options || [] as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	{:else if filter.type === 'SOLIDCHOICE'}
		<div class="flex flex-col">
			<span class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<div class="flex flex-wrap gap-2">
				{#each filter.options || [] as option}
					<label class="inline-flex items-center space-x-1 text-sm">
						<input
							type="radio"
							name="{filter.id}-group"
							value={option.value}
							checked={filter.value === option.value}
							onchange={(e) => {
								if (e.currentTarget.checked) handleInputChange(filter.id, option.value);
							}}
							class="text-primary focus:ring-primary"
						/>
						<span>{option.label}</span>
					</label>
				{/each}
				{#if filter.value}
					<button
						type="button"
						onclick={() => handleInputChange(filter.id, '')}
						class="text-xs text-gray-500 hover:text-primary underline"
					>
						Clear
					</button>
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

{#snippet mobileFilterInput(filter: FilterConfig)}
	{#if filter.type === 'STRING' || filter.type === 'REFERENCE' || filter.type === 'SPLITSTRING'}
		<div class="flex flex-col">
			<label for="{filter.id}-mobile" class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-mobile"
				type="text"
				value={filter.value || ''}
				oninput={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				placeholder={filter.placeholder || ''}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>
	{:else if filter.type === 'SINGLEDATE'}
		<div class="flex flex-col">
			<label for="{filter.id}-mobile" class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-mobile"
				type="date"
				value={filter.value || ''}
				oninput={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>
	{:else if filter.type === 'DATE'}
		<div class="flex flex-col">
			<span class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<div class="space-y-2">
				<div class="flex flex-col">
					<label for="{filter.id}-mobile-start" class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">From</label>
					<input
						id="{filter.id}-mobile-start"
						type="date"
						value={getDateValue(filter, 'start')}
						oninput={(e) => handleDateChange(filter, 'start', e.currentTarget.value)}
						class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					/>
				</div>
				<div class="flex flex-col">
					<label for="{filter.id}-mobile-end" class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">To</label>
					<input
						id="{filter.id}-mobile-end"
						type="date"
						value={getDateValue(filter, 'end')}
						oninput={(e) => handleDateChange(filter, 'end', e.currentTarget.value)}
						class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>
	{:else if filter.type === 'CHOICE'}
		<div class="flex flex-col">
			<label for="{filter.id}-mobile" class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<select
				id="{filter.id}-mobile"
				value={filter.value || ''}
				onchange={(e) => handleInputChange(filter.id, e.currentTarget.value)}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700"
			>
				<option value="">-- Select --</option>
				{#each filter.options || [] as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	{:else if filter.type === 'SOLIDCHOICE'}
		<div class="flex flex-col">
			<span class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<div class="flex flex-wrap gap-3">
				{#each filter.options || [] as option}
					<label class="inline-flex items-center space-x-2 text-sm">
						<input
							type="radio"
							name="{filter.id}-mobile-group"
							value={option.value}
							checked={filter.value === option.value}
							onchange={(e) => {
								if (e.currentTarget.checked) handleInputChange(filter.id, option.value);
							}}
							class="text-primary focus:ring-primary"
						/>
						<span>{option.label}</span>
					</label>
				{/each}
				{#if filter.value}
					<button
						type="button"
						onclick={() => handleInputChange(filter.id, '')}
						class="text-sm text-gray-500 hover:text-primary underline"
					>
						Clear
					</button>
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

{#if !isMobile}
	<div class="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
		{#each filters as filter}
			{@render filterInput(filter)}
		{/each}
		{#if filters.length > 0}
			<button
				onclick={onClearFilters}
				class="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
			>
				Clear filters
			</button>
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-between p-2">
		<button
			onclick={() => (mobileDrawerOpen = true)}
			class="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
			</svg>
			{#if activeFilterCount > 0}
				<span class="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
					{activeFilterCount}
				</span>
			{/if}
			<span class="text-sm">Filters</span>
		</button>
	</div>

	{#if mobileDrawerOpen}
		<div class="fixed inset-0 z-50" role="dialog" aria-modal="true">
			<button
				class="absolute inset-0 bg-black/50"
				onclick={() => (mobileDrawerOpen = false)}
				aria-label="Close filters overlay"
			></button>
			<div class="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-xl p-4 max-h-[80vh] overflow-y-auto">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Filters</h2>
					<button
						onclick={() => (mobileDrawerOpen = false)}
						class="p-2"
						aria-label="Close filters"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="space-y-3">
					{#each filters as filter}
						{@render mobileFilterInput(filter)}
					{/each}
				</div>
				<div class="mt-4 flex space-x-2">
					<button
						onclick={() => {
							onClearFilters?.();
							mobileDrawerOpen = false;
						}}
						class="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
					>
						Clear
					</button>
					<button
						onclick={() => (mobileDrawerOpen = false)}
						class="flex-1 px-4 py-2 bg-primary text-white rounded-lg"
					>
						Apply
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
