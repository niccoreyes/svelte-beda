<script module lang="ts">
	export type FilterType = 'STRING' | 'DATE' | 'SINGLEDATE' | 'REFERENCE' | 'CHOICE' | 'SOLIDCHOICE' | 'SPLITSTRING' | 'VALUESET' | 'SELECTCHOICE';

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
		valueSetUrl?: string;
		multi?: boolean;
		searchBehavior?: 'AND' | 'OR';
		placement?: 'search-bar' | 'table' | ('search-bar' | 'table')[];
		searchParam?: string;
	}

	export function serializeFilters(filters: FilterConfig[]): Record<string, string | string[]> {
		const result: Record<string, string | string[]> = {};
		for (const filter of filters) {
			const serialized = serializeFilterValue(filter);
			if (serialized !== undefined) {
				const key = filter.searchParam || filter.id;
				result[key] = serialized;
			}
		}
		return result;
	}

	export function serializeFilterValue(filter: FilterConfig): string | string[] | undefined {
		const { type, value, resourceType, delimiter, searchBehavior } = filter;
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
			case 'VALUESET':
				return value;
			case 'SELECTCHOICE': {
				try {
					const parsed = JSON.parse(value) as string[];
					return parsed.length > 0 ? parsed : undefined;
				} catch {
					return value ? [value] : undefined;
				}
			}
		case 'SPLITSTRING': {
			const parts = value.split(delimiter || ',').map((v) => v.trim()).filter(Boolean);
			if (parts.length === 0) return undefined;
			if (searchBehavior === 'OR') {
				return parts.join(',');
			}
			return parts;
		}
			default:
				return value;
		}
	}
</script>

<script lang="ts">
	import { debounce } from '$lib/utils/debounce';
	import { getFHIRResources, expandEMRValueSet } from '$lib/fhir';

	interface Props {
		filters?: FilterConfig[];
		onFilterChange?: (id: string, value: string) => void;
		onClearFilters?: () => void;
		compact?: boolean;
	}

	let { filters = [], onFilterChange, onClearFilters, compact = false }: Props = $props();

	let visibleFilters = $derived(
		filters.filter((f) => {
			if (!f.placement) return true;
			const placements = Array.isArray(f.placement) ? f.placement : [f.placement];
			return placements.includes('search-bar');
		})
	);

	let isMobile = $state(false);
	let mobileDrawerOpen = $state(false);

	// Async search state for REFERENCE filters
	let referenceSearchResults = $state<Record<string, Array<{ value: string; label: string }>>>({});
	let referenceSearchLoading = $state<Record<string, boolean>>({});
	let referenceSearchOpen = $state<Record<string, boolean>>({});

	// ValueSet expansion state
	let valueSetOptions = $state<Record<string, FilterOption[]>>({});
	let valueSetLoading = $state<Record<string, boolean>>({});

	// SelectChoice state
	let selectChoiceOpen = $state<Record<string, boolean>>({});

	let activeFilterCount = $derived(
		visibleFilters.filter((f) => {
			if (!f.value || f.value === '') return false;
			if (f.type === 'DATE') {
				try {
					const parsed = JSON.parse(f.value) as { start?: string; end?: string };
					return !!parsed.start || !!parsed.end;
				} catch {
					return false;
				}
			}
			if (f.type === 'SELECTCHOICE') {
				try {
					const parsed = JSON.parse(f.value) as string[];
					return parsed.length > 0;
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

	// Load ValueSet options on mount
	$effect(() => {
		filters.forEach((filter) => {
			if (filter.type === 'VALUESET' && filter.valueSetUrl && !valueSetOptions[filter.id]) {
				loadValueSetOptions(filter.id, filter.valueSetUrl);
			}
		});
	});

	async function loadValueSetOptions(filterId: string, url: string) {
		valueSetLoading[filterId] = true;
		try {
			const result = await expandEMRValueSet(url);
			const expansion = (result as any)?.expansion?.contains || [];
			valueSetOptions[filterId] = expansion.map((item: any) => ({
				value: item.code,
				label: item.display || item.code
			}));
		} catch {
			valueSetOptions[filterId] = [];
		} finally {
			valueSetLoading[filterId] = false;
		}
	}

	const debouncedReferenceSearch = debounce(async (filterId: string, resourceType: string, query: string) => {
		if (!query || query.length < 2) {
			referenceSearchResults[filterId] = [];
			return;
		}
		referenceSearchLoading[filterId] = true;
		try {
			const params: Record<string, string> = { _count: '10' };
			if (resourceType === 'Patient') {
				params.name = query;
			} else if (resourceType === 'Practitioner') {
				params.name = query;
			} else {
				params['name:contains'] = query;
			}
			const bundle = await getFHIRResources(resourceType, params);
			const resources = bundle.entry?.map((e) => e.resource).filter(Boolean) || [];
			referenceSearchResults[filterId] = resources.map((r: any) => {
				let label = r.name?.[0] ? formatName(r.name[0]) : (r.name || r.id || r.resourceType);
				return { value: `${r.resourceType}/${r.id}`, label };
			});
		} catch {
			referenceSearchResults[filterId] = [];
		} finally {
			referenceSearchLoading[filterId] = false;
		}
	}, 300);

	function formatName(name: { given?: string[]; family?: string; text?: string }): string {
		if (name.text) return name.text;
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	function handleReferenceSearch(filter: FilterConfig, query: string) {
		if (!filter.resourceType) return;
		debouncedReferenceSearch(filter.id, filter.resourceType, query);
		referenceSearchOpen[filter.id] = true;
	}

	function selectReferenceOption(filterId: string, option: { value: string; label: string }) {
		onFilterChange?.(filterId, option.value);
		referenceSearchOpen[filterId] = false;
		referenceSearchResults[filterId] = [];
	}

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

	function toggleSelectChoice(filterId: string) {
		selectChoiceOpen[filterId] = !selectChoiceOpen[filterId];
	}

	function isSelectChoiceSelected(filter: FilterConfig, optionValue: string): boolean {
		if (!filter.value) return false;
		try {
			const parsed = JSON.parse(filter.value) as string[];
			return parsed.includes(optionValue);
		} catch {
			return filter.value === optionValue;
		}
	}

	function toggleSelectChoiceOption(filter: FilterConfig, optionValue: string) {
		let selected: string[] = [];
		try {
			if (filter.value) selected = JSON.parse(filter.value) as string[];
		} catch {
			if (filter.value) selected = [filter.value];
		}
		if (selected.includes(optionValue)) {
			selected = selected.filter((v) => v !== optionValue);
		} else {
			selected = [...selected, optionValue];
		}
		onFilterChange?.(filter.id, JSON.stringify(selected));
	}

	function getSelectChoiceLabel(filter: FilterConfig): string {
		if (!filter.value || filter.value === '[]') return '';
		try {
			const parsed = JSON.parse(filter.value) as string[];
			const labels = parsed.map((v) => filter.options?.find((o) => o.value === v)?.label || v);
			return labels.join(', ');
		} catch {
			return filter.options?.find((o) => o.value === filter.value)?.label || filter.value || '';
		}
	}

	function getReferenceDisplayValue(filter: FilterConfig): string {
		if (!filter.value) return '';
		const option = referenceSearchResults[filter.id]?.find((o) => o.value === filter.value);
		if (option) return option.label;
		return filter.value;
	}
</script>

{#snippet filterInput(filter: FilterConfig)}
	{#if filter.type === 'STRING' || filter.type === 'SPLITSTRING'}
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
	{:else if filter.type === 'REFERENCE'}
		<div class="flex flex-col relative">
			<label for="{filter.id}-input" class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-input"
				type="text"
				value={filter.value ? getReferenceDisplayValue(filter) : ''}
				oninput={(e) => handleReferenceSearch(filter, e.currentTarget.value)}
				onfocus={() => { if (filter.value) referenceSearchOpen[filter.id] = true; }}
				placeholder={filter.placeholder || `Search ${filter.resourceType || 'reference'}...`}
				class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
			{#if referenceSearchLoading[filter.id]}
				<div class="absolute right-2 top-6">
					<svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
			{/if}
			{#if referenceSearchOpen[filter.id] && (referenceSearchResults[filter.id] || []).length > 0}
				<div class="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-48 overflow-auto top-14">
					{#each referenceSearchResults[filter.id] || [] as option}
						<button
							type="button"
							onclick={() => selectReferenceOption(filter.id, option)}
							class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 {option.value === filter.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}"
						>
							{option.label}
							<span class="text-xs text-gray-400 ml-1">{option.value}</span>
						</button>
					{/each}
				</div>
			{/if}
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
	{:else if filter.type === 'VALUESET'}
		<div class="flex flex-col">
			<label for="{filter.id}-input" class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			{#if valueSetLoading[filter.id]}
				<div class="px-2 py-1 text-sm text-gray-400">Loading...</div>
			{:else}
				<select
					id="{filter.id}-input"
					value={filter.value || ''}
					onchange={(e) => handleInputChange(filter.id, e.currentTarget.value)}
					class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700"
				>
					<option value="">-- Select --</option>
					{#each valueSetOptions[filter.id] || [] as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{/if}
		</div>
	{:else if filter.type === 'SELECTCHOICE'}
		<div class="flex flex-col relative">
			<span class="text-xs text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<button
				type="button"
				onclick={() => toggleSelectChoice(filter.id)}
				class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700 text-left flex items-center justify-between"
			>
				<span class="truncate {getSelectChoiceLabel(filter) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">
					{getSelectChoiceLabel(filter) || (filter.placeholder || 'Select...')}
				</span>
				<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if selectChoiceOpen[filter.id]}
				<div class="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-48 overflow-auto">
					{#each filter.options || [] as option}
						<label class="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer {isSelectChoiceSelected(filter, option.value) ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-200'}">
							<input
								type="checkbox"
								checked={isSelectChoiceSelected(filter, option.value)}
								onchange={() => toggleSelectChoiceOption(filter, option.value)}
								class="mr-2 text-primary focus:ring-primary"
							/>
							{option.label}
						</label>
					{/each}
					{#if filter.value && filter.value !== '[]'}
						<button
							type="button"
							onclick={() => handleInputChange(filter.id, '[]')}
							class="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-primary underline"
						>
							Clear all
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet mobileFilterInput(filter: FilterConfig)}
	{#if filter.type === 'STRING' || filter.type === 'SPLITSTRING'}
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
	{:else if filter.type === 'REFERENCE'}
		<div class="flex flex-col relative">
			<label for="{filter.id}-mobile" class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			<input
				id="{filter.id}-mobile"
				type="text"
				value={filter.value ? getReferenceDisplayValue(filter) : ''}
				oninput={(e) => handleReferenceSearch(filter, e.currentTarget.value)}
				onfocus={() => { if (filter.value) referenceSearchOpen[filter.id] = true; }}
				placeholder={filter.placeholder || `Search ${filter.resourceType || 'reference'}...`}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
			{#if referenceSearchLoading[filter.id]}
				<div class="absolute right-2 top-8">
					<svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
			{/if}
			{#if referenceSearchOpen[filter.id] && (referenceSearchResults[filter.id] || []).length > 0}
				<div class="z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto">
					{#each referenceSearchResults[filter.id] || [] as option}
						<button
							type="button"
							onclick={() => selectReferenceOption(filter.id, option)}
							class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 {option.value === filter.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}"
						>
							{option.label}
							<span class="text-xs text-gray-400 ml-1">{option.value}</span>
						</button>
					{/each}
				</div>
			{/if}
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
	{:else if filter.type === 'VALUESET'}
		<div class="flex flex-col">
			<label for="{filter.id}-mobile" class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</label>
			{#if valueSetLoading[filter.id]}
				<div class="px-3 py-2 text-sm text-gray-400">Loading...</div>
			{:else}
				<select
					id="{filter.id}-mobile"
					value={filter.value || ''}
					onchange={(e) => handleInputChange(filter.id, e.currentTarget.value)}
					class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700"
				>
					<option value="">-- Select --</option>
					{#each valueSetOptions[filter.id] || [] as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			{/if}
		</div>
	{:else if filter.type === 'SELECTCHOICE'}
		<div class="flex flex-col relative">
			<span class="text-sm text-gray-500 dark:text-gray-400 mb-1">{filter.label}</span>
			<button
				type="button"
				onclick={() => toggleSelectChoice(filter.id)}
				class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white dark:bg-gray-700 text-left flex items-center justify-between"
			>
				<span class="truncate {getSelectChoiceLabel(filter) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">
					{getSelectChoiceLabel(filter) || (filter.placeholder || 'Select...')}
				</span>
				<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{#if selectChoiceOpen[filter.id]}
				<div class="z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto">
					{#each filter.options || [] as option}
						<label class="flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer {isSelectChoiceSelected(filter, option.value) ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-200'}">
							<input
								type="checkbox"
								checked={isSelectChoiceSelected(filter, option.value)}
								onchange={() => toggleSelectChoiceOption(filter, option.value)}
								class="mr-2 text-primary focus:ring-primary"
							/>
							{option.label}
						</label>
					{/each}
					{#if filter.value && filter.value !== '[]'}
						<button
							type="button"
							onclick={() => handleInputChange(filter.id, '[]')}
							class="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-primary underline"
						>
							Clear all
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{#if !isMobile}
	<div class="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
		{#each visibleFilters as filter}
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
		{#if compact}
			<button
				onclick={() => (mobileDrawerOpen = true)}
				class="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
				aria-label="Open search filters"
			>
				<svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				{#if activeFilterCount > 0}
					<span class="absolute top-1 right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
						{activeFilterCount}
					</span>
				{/if}
			</button>
		{:else}
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
		{/if}
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
					{#each visibleFilters as filter}
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
