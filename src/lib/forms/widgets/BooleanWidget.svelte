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

	let checked = $state(answer?.valueBoolean ?? false);

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		checked = target.checked;
		onChange({ valueBoolean: checked });
	}
</script>

<div class="form-field">
	<div class="flex items-center gap-2">
		{#if readonly}
			<div class="p-2 bg-gray-100 rounded text-sm">{checked ? 'Yes' : 'No'}</div>
		{:else}
			<input
				id={item.linkId}
				type="checkbox"
				checked={checked}
				onchange={handleChange}
				class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
			/>
		{/if}
		<label for={item.linkId} class="text-sm font-medium">
			{item.text ?? item.linkId}
			{#if item.required}<span class="text-red-500">*</span>{/if}
		</label>
	</div>
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
