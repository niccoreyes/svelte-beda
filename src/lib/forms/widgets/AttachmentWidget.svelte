<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
	import { uploadFile } from '$lib/fhir/file-upload';
	import UploadProgress from '$lib/components/UploadProgress.svelte';

	interface Props {
		item: QuestionnaireItem;
		answer?: QuestionnaireResponseItemAnswer;
		onChange: (answer: QuestionnaireResponseItemAnswer) => void;
		readonly?: boolean;
		error?: string;
	}

	let { item, answer, onChange, readonly = false, error }: Props = $props();

	let fileName = $state(answer?.valueAttachment?.title ?? answer?.valueAttachment?.url ?? '');
	let progress = $state(0);
	let uploading = $state(false);
	let uploadStatus = $state<'uploading' | 'complete' | 'error' | undefined>(undefined);

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		fileName = file.name;
		uploading = true;
		uploadStatus = 'uploading';
		progress = 0;

		try {
			const { key } = await uploadFile(file, (pct) => {
				progress = pct;
			});
			uploadStatus = 'complete';
			onChange({
				valueAttachment: {
					contentType: file.type,
					url: key,
					title: file.name
				}
			});
		} catch {
			// Fallback to base64 inline upload on failure
			uploadStatus = 'error';
			const reader = new FileReader();
			reader.onload = () => {
				const data = reader.result as string;
				onChange({
					valueAttachment: {
						contentType: file.type,
						data: data.split(',')[1],
						title: file.name
					}
				});
			};
			reader.readAsDataURL(file);
		} finally {
			uploading = false;
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
			disabled={uploading}
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'} {uploading ? 'opacity-50' : ''}"
		/>
		{#if uploading || uploadStatus === 'complete' || uploadStatus === 'error'}
			<div class="mt-2">
				<UploadProgress {progress} filename={fileName} status={uploadStatus} />
			</div>
		{:else if fileName}
			<p class="text-xs text-gray-600 mt-1">Selected: {fileName}</p>
		{/if}
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
