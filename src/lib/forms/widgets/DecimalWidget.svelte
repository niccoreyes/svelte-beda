<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';

	interface Props {
		item: QuestionnaireItem;
		answer?: QuestionnaireResponseItemAnswer;
		onChange: (answer: QuestionnaireResponseItemAnswer) => void;
		readonly?: boolean;
		error?: string;
	}

	let { item, answer, onChange, readonly = false, error }: Props = $props();

	let value = $state(answer?.valueDecimal?.toString() ?? '');

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		const num = parseFloat(value);
		if (!isNaN(num)) {
			onChange({ valueDecimal: num });
		} else if (value === '') {
			onChange({});
		}
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm">{value || '-'}</div>
	{:else}
		<input
			id={item.linkId}
			type="number"
			step="0.01"
			value={value}
			oninput={handleInput}
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'}"
		/>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
