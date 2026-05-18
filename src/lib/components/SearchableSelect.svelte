<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		onChange?: (value: string) => void;
		label?: string;
		placeholder?: string;
		searchPlaceholder?: string;
		disabled?: boolean;
		required?: boolean;
	}

	let { options, value = '', onChange, label, placeholder = 'Select...', searchPlaceholder = 'Search...', disabled = false, required = false }: Props = $props();

	let open = $state(false);
	let search = $state('');
	let selectedLabel = $derived(options.find((o) => o.value === value)?.label || '');

	let filteredOptions = $derived(
		search.trim() === ''
			? options
			: options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
	);

	function selectOption(option: Option) {
		onChange?.(option.value);
		open = false;
		search = '';
	}

	function toggle() {
		if (!disabled) open = !open;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="form-field relative">
	{#if label}
		<label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}
	<button
		type="button"
		onclick={toggle}
		{disabled}
		class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-left text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
	>
		<span class="truncate {value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">
			{selectedLabel || placeholder}
		</span>
		<svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<div class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-auto">
			<div class="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
				<input
					type="text"
					placeholder={searchPlaceholder}
					bind:value={search}
					class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
					autofocus
				/>
			</div>
			{#if filteredOptions.length === 0}
				<div class="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">No results</div>
			{:else}
				{#each filteredOptions as option (option.value)}
					<button
						type="button"
						onclick={() => selectOption(option)}
						class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 {option.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 dark:text-gray-200'}"
					>
						{option.label}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
