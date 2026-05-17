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

	let value = $state(0);
	const min = $derived(item.extension?.find((e) => e.url?.includes('minValue'))?.valueInteger ?? 0);
	const max = $derived(item.extension?.find((e) => e.url?.includes('maxValue'))?.valueInteger ?? 100);
	const step = $derived(item.extension?.find((e) => e.url?.includes('sliderStep'))?.valueInteger ?? 1);

	$effect(() => {
		value = answer?.valueInteger ?? answer?.valueDecimal ?? 0;
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = Number(target.value);
		if (item.type === 'integer') {
			onChange({ valueInteger: value });
		} else {
			onChange({ valueDecimal: value });
		}
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm">{value}</div>
	{:else}
		<div class="flex items-center gap-3">
			<input
				id={item.linkId}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				oninput={handleInput}
				class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
			/>
			<span class="text-sm font-medium w-8">{value}</span>
		</div>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
