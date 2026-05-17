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

	let fileName = $state('');
	let fileSize = $state(0);
	let progress = $state(0);
	let uploading = $state(false);
	let uploadStatus = $state<'uploading' | 'complete' | 'error' | undefined>(undefined);
	let validationError = $state('');

	const maxSize = $derived(() => {
		const ext = item.extension?.find(
			(e) => e.url === 'http://hl7.org/fhir/StructureDefinition/maxSize'
		);
		return ext?.valueInteger ? ext.valueInteger * 1024 * 1024 : undefined;
	});

	const allowedTypes = $derived(() => {
		const ext = item.extension?.find(
			(e) => e.url === 'http://hl7.org/fhir/StructureDefinition/mimeType'
		);
		return ext?.valueString ? ext.valueString.split(',').map((t) => t.trim()) : undefined;
	});

	$effect(() => {
		fileName = answer?.valueAttachment?.title ?? '';
		fileSize = 0;
	});

	function validateFile(file: File): string | null {
		if (maxSize() && file.size > maxSize()!) {
			return `File too large. Max size: ${(maxSize()! / 1024 / 1024).toFixed(1)} MB.`;
		}
		if (allowedTypes() && allowedTypes()!.length > 0) {
			const normalized = file.type || '';
			const isAllowed = allowedTypes()!.some((type) => {
				if (type.includes('*')) {
					return normalized.startsWith(type.split('/')[0]!);
				}
				return type === normalized;
			});
			if (!isAllowed) {
				return `Invalid file type. Allowed: ${allowedTypes()!.join(', ')}`;
			}
		}
		return null;
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		validationError = '';
		const err = validateFile(file);
		if (err) {
			validationError = err;
			return;
		}

		fileName = file.name;
		fileSize = file.size;
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

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
			{#if fileSize > 0}
				<span class="text-xs text-gray-500 ml-1">({formatSize(fileSize)})</span>
			{/if}
		</div>
	{:else}
		<input
			id={item.linkId}
			type="file"
			onchange={handleFileChange}
			disabled={uploading}
			class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error || validationError ? 'border-red-500' : 'border-gray-300'} {uploading ? 'opacity-50' : ''}"
		/>
		{#if maxSize() || allowedTypes()}
			<p class="text-xs text-gray-500 mt-1">
				{#if maxSize()}
					Max size: {formatSize(maxSize()!)}
				{/if}
				{#if maxSize() && allowedTypes()}
					•
				{/if}
				{#if allowedTypes()}
					Allowed: {allowedTypes()?.join(', ')}
				{/if}
			</p>
		{/if}
		{#if uploading || uploadStatus === 'complete' || uploadStatus === 'error'}
			<div class="mt-2">
				<UploadProgress {progress} filename={fileName} status={uploadStatus} />
			</div>
		{:else if fileName}
			<p class="text-xs text-gray-600 mt-1">
				Selected: {fileName}
				{#if fileSize > 0}
					({formatSize(fileSize)})
				{/if}
			</p>
		{/if}
	{/if}
	{#if validationError}<p class="text-red-500 text-xs mt-1">{validationError}</p>{/if}
	{#if error && !validationError}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
