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

	let value = $state(answer?.valueString ?? '');

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
		<div class="p-2 bg-gray-100 rounded text-sm">{value || '-'}</div>
	{:else}
		<div class="flex gap-2">
			<select class="w-20 px-2 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'}">
				<option value="+">+</option>
				<option value="+1">+1</option>
				<option value="+44">+44</option>
				<option value="+49">+49</option>
			</select>
			<input
				id={item.linkId}
				type="tel"
				value={value}
				oninput={handleInput}
				placeholder="Phone number"
				class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'}"
			/>
		</div>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
