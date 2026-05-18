<script lang="ts">
	import type { DocumentReference } from 'fhir/r4b';
	import { createFHIRResource } from '$lib/fhir';
	import Modal from '$lib/components/Modal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	interface Props {
		patientId: string;
		patientName?: string;
		open: boolean;
		onClose: () => void;
		onSaved?: () => void;
	}

	let { patientId, patientName, open, onClose, onSaved }: Props = $props();

	let step = $state(1);
	let docType = $state('');
	let docStatus = $state('current');
	let docContent = $state('');
	let docDescription = $state('');
	let saving = $state(false);
	let error = $state('');

	const steps = [
		{ id: 1, label: 'Type' },
		{ id: 2, label: 'Content' },
		{ id: 3, label: 'Review' },
		{ id: 4, label: 'Submit' }
	];

	const docTypes = [
		{ value: '11502-2', label: 'Laboratory Report', system: 'http://loinc.org' },
		{ value: '18842-5', label: 'Discharge Summary', system: 'http://loinc.org' },
		{ value: '34133-9', label: 'Progress Note', system: 'http://loinc.org' },
		{ value: '11488-4', label: 'Consultation Note', system: 'http://loinc.org' }
	];

	function reset() {
		step = 1;
		docType = '';
		docStatus = 'current';
		docContent = '';
		docDescription = '';
		saving = false;
		error = '';
	}

	function close() {
		reset();
		onClose();
	}

	async function submit() {
		saving = true;
		error = '';
		try {
			const typeConfig = docTypes.find((t) => t.value === docType);
			const doc: DocumentReference = {
				resourceType: 'DocumentReference',
				status: docStatus as DocumentReference['status'],
				type: {
					coding: typeConfig
						? [{ system: typeConfig.system, code: typeConfig.value, display: typeConfig.label }]
						: undefined,
					text: typeConfig?.label || 'Document'
				},
				subject: { reference: `Patient/${patientId}`, display: patientName },
				date: new Date().toISOString(),
				content: [
					{
						attachment: {
							contentType: 'text/plain',
							title: typeConfig?.label || 'Document',
							data: btoa(docContent)
						}
					}
				],
				description: docDescription || undefined
			};
			await createFHIRResource(doc);
			onSaved?.();
			close();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save document';
		} finally {
			saving = false;
		}
	}
</script>

<Modal {open} title="Create Document" onClose={close}>
	<div class="space-y-4">
		<!-- Step indicator -->
		<div class="flex items-center gap-2 mb-4">
			{#each steps as s, i (s.id)}
				<div class="flex items-center gap-2">
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium {step >= s.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}"
					>
						{s.id}
					</div>
					<span class="text-sm {step >= s.id ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'}">{s.label}</span>
				</div>
				{#if i < steps.length - 1}
					<div class="w-6 h-px bg-gray-300 dark:bg-gray-600"></div>
				{/if}
			{/each}
		</div>

		{#if step === 1}
			<div class="space-y-3">
				<p class="text-sm text-gray-600 dark:text-gray-300">Select the document type:</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each docTypes as t (t.value)}
					<button
						onclick={() => { docType = t.value; step = 2; }}
						class="p-3 text-left border rounded-lg transition-colors {docType === t.value ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
					>
						<p class="font-medium">{t.label}</p>
						<p class="text-xs text-gray-500">{t.system} · {t.value}</p>
					</button>
				{/each}
				</div>
				<div class="flex justify-end mt-4">
					<button
						disabled={!docType}
						onclick={() => step = 2}
						class="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		{:else if step === 2}
			<div class="space-y-3">
			<div>
				<label for="doc-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
				<select
					id="doc-status"
					value={docStatus}
					onchange={(e) => (docStatus = e.currentTarget.value)}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
				>
					<option value="current">Current</option>
					<option value="superseded">Superseded</option>
					<option value="entered-in-error">Entered in Error</option>
				</select>
			</div>
			<div>
				<label for="doc-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
				<textarea
					id="doc-content"
					value={docContent}
					oninput={(e) => (docContent = e.currentTarget.value)}
					rows={6}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
					placeholder="Enter document content..."
				></textarea>
			</div>
			<div>
				<label for="doc-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
				<input
					id="doc-description"
					type="text"
					value={docDescription}
					oninput={(e) => (docDescription = e.currentTarget.value)}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
					placeholder="Optional description..."
				/>
				</div>
				<div class="flex justify-between mt-4">
					<button onclick={() => step = 1} class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Back</button>
					<button
						disabled={!docContent.trim()}
						onclick={() => step = 3}
						class="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
					>
						Next
					</button>
				</div>
			</div>
		{:else if step === 3}
			<div class="space-y-3">
				<p class="text-sm text-gray-600 dark:text-gray-300">Review the document before submitting:</p>
				<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
					<p><span class="font-medium">Type:</span> {docTypes.find((t) => t.value === docType)?.label || '-'}</p>
					<p><span class="font-medium">Status:</span> {docStatus}</p>
					<p><span class="font-medium">Patient:</span> {patientName || patientId}</p>
					<p><span class="font-medium">Description:</span> {docDescription || '-'}</p>
					<div class="border-t pt-2 mt-2">
						<p class="font-medium text-sm mb-1">Content:</p>
						<pre class="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-auto max-h-40">{docContent}</pre>
					</div>
				</div>
				<div class="flex justify-between mt-4">
					<button onclick={() => step = 2} class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Back</button>
					<button onclick={() => step = 4} class="px-4 py-2 bg-primary text-white rounded-lg">Next</button>
				</div>
			</div>
		{:else if step === 4}
			<div class="space-y-3">
				{#if error}
					<div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">{error}</div>
				{/if}
				<p class="text-sm text-gray-600 dark:text-gray-300">Ready to save the document to the FHIR server.</p>
				<div class="flex justify-between mt-4">
					<button onclick={() => step = 3} class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" disabled={saving}>Back</button>
					<button
						onclick={submit}
						disabled={saving}
						class="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
					>
						{#if saving}
							<Spinner />
						{/if}
						{saving ? 'Saving...' : 'Save Document'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</Modal>
