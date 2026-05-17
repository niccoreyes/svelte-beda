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

	let value = $state('');

	$effect(() => {
		value = answer?.valueString ?? '';
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		onChange({ valueString: value });
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm font-mono">{value || '-'}</div>
	{:else}
		<input
			id={item.linkId}
			type="text"
			value={value}
			oninput={handleInput}
			placeholder="Scan or enter barcode"
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary font-mono {error ? 'border-red-500' : 'border-gray-300'}"
		/>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
