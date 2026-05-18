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

	let selectedValue = $state(answer?.valueCoding?.code ?? '');
	const options = $derived(item.answerOption ?? []);

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedValue = target.value;
		const selectedOption = options.find((opt) => opt.valueCoding?.code === selectedValue);
		if (selectedOption?.valueCoding) {
			onChange({ valueCoding: selectedOption.valueCoding });
		} else {
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
		<div class="p-2 bg-gray-100 rounded text-sm">
			{answer?.valueCoding?.display ?? answer?.valueCoding?.code ?? '-'}
		</div>
	{:else}
		<select
			id={item.linkId}
			value={selectedValue}
			onchange={handleChange}
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'}"
		>
			<option value="">-- Select --</option>
			{#each options as option (option.valueCoding?.code ?? option.valueString)}
				<option value={option.valueCoding?.code}>
					{option.valueCoding?.display ?? option.valueCoding?.code}
				</option>
			{/each}
		</select>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
