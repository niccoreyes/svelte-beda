<script lang="ts">
	interface FilterConfig {
		type: 'text' | 'select';
		options?: Array<{ value: string; label: string }>;
		placeholder?: string;
	}

	interface Props {
		filter: FilterConfig;
		value?: string;
		onChange: (value: string) => void;
	}

	let { filter, value = '', onChange }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onChange(target.value);
	}

	function handleSelect(e: Event) {
		const target = e.target as HTMLSelectElement;
		onChange(target.value);
	}

</script>

<div class="mt-1">
	{#if filter.type === 'text'}
		<input
			type="text"
			{value}
			placeholder={filter.placeholder || 'Filter...'}
			oninput={handleInput}
			onclick={(e) => e.stopPropagation()}
			class="w-full text-xs px-2 py-1 rounded border border-[var(--gray-4)] bg-[var(--gray-1)] dark:bg-[var(--gray-4)] text-[var(--gray-10)] dark:text-[var(--gray-10)] placeholder-[var(--gray-6)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
		/>
	{:else if filter.type === 'select'}
		<select
			{value}
			onchange={handleSelect}
			onclick={(e) => e.stopPropagation()}
			class="w-full text-xs px-2 py-1 rounded border border-[var(--gray-4)] bg-[var(--gray-1)] dark:bg-[var(--gray-4)] text-[var(--gray-10)] dark:text-[var(--gray-10)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
		>
			<option value="">All</option>
			{#each filter.options || [] as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
	{/if}
</div>
