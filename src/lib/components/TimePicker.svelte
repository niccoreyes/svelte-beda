<script lang="ts">
	interface Props {
		value?: string;
		onChange?: (value: string) => void;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		min?: string;
		max?: string;
		step?: string;
	}

	let { value = '', onChange, label, placeholder, disabled = false, required = false, min, max, step }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onChange?.(target.value);
	}
</script>

<div class="form-field">
	{#if label}
		<label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}
	<input
		type="time"
		value={value}
		oninput={handleInput}
		{placeholder}
		{disabled}
		{required}
		{min}
		{max}
		{step}
		class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white text-sm"
	/>
</div>
