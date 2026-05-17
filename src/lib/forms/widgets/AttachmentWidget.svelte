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

	let fileName = $state('');

	$effect(() => {
		fileName = answer?.valueAttachment?.title ?? answer?.valueAttachment?.url ?? '';
	});

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			fileName = file.name;
			const reader = new FileReader();
			reader.onload = () => {
				const data = reader.result as string;
				onChange({
					valueAttachment: {
						contentType: file.type,
						data: data.split(',')[1], // remove data: prefix
						title: file.name
					}
				});
			};
			reader.readAsDataURL(file);
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
			{fileName || 'No file attached'}
		</div>
	{:else}
		<input
			id={item.linkId}
			type="file"
			onchange={handleFileChange}
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'}"
		/>
		{#if fileName}<p class="text-xs text-gray-600 mt-1">Selected: {fileName}</p>{/if}
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
