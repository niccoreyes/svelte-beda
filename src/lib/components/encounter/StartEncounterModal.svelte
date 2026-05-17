<script lang="ts">
	import { createFHIRResource } from '$lib/fhir';
	import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import type { Encounter } from 'fhir/r4b';

	interface Props {
		open?: boolean;
		patientId: string;
		onClose?: () => void;
	}

	let { open = false, patientId, onClose }: Props = $props();

	let encounterTypeCode = $state('');
	let practitionerRef = $state('');
	let reason = $state('');
	let submitting = $state(false);

	const encounterTypes = [
		{ code: 'AMB', display: 'Ambulatory' },
		{ code: 'EMER', display: 'Emergency' },
		{ code: 'HH', display: 'Home Health' },
		{ code: 'TELE', display: 'Telemedicine' },
		{ code: 'IMP', display: 'Inpatient' },
		{ code: 'OBSENC', display: 'Observation' }
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!encounterTypeCode) return;

		const selectedType = encounterTypes.find((t) => t.code === encounterTypeCode);
		if (!selectedType) return;

		submitting = true;
		try {
			const encounter: Encounter = {
				resourceType: 'Encounter',
				status: 'in-progress',
				class: {
					system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
					code: selectedType.code,
					display: selectedType.display
				},
				type: [
					{
						coding: [
							{
								system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
								code: selectedType.code,
								display: selectedType.display
							}
						]
					}
				],
				subject: { reference: `Patient/${patientId}` },
				participant: practitionerRef
					? [{ individual: { reference: practitionerRef } }]
					: [],
				reasonCode: reason ? [{ text: reason }] : [],
				period: { start: new Date().toISOString() }
			};

			const result = await createFHIRResource(encounter);
			if (result.id) {
				goto(`/patients/${patientId}/encounters/${result.id}/`);
			}
			onClose?.();
		} catch (err) {
			console.error('Failed to create encounter:', err);
		} finally {
			submitting = false;
		}
	}
</script>

<Modal {open} title="Start Encounter" onClose={onClose}>
	<form onsubmit={handleSubmit} class="space-y-4">
		<div>
			<label for="encounter-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
				>Encounter Type</label
			>
			<select
				id="encounter-type"
				bind:value={encounterTypeCode}
				required
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			>
				<option value="">Select type...</option>
				{#each encounterTypes as t}
					<option value={t.code}>{t.display}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="practitioner-ref" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
				>Practitioner</label
			>
			<input
				id="practitioner-ref"
				type="text"
				bind:value={practitionerRef}
				placeholder="Practitioner/123 or reference"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
		</div>

		<div>
			<label for="reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
				>Reason for Visit</label
			>
			<textarea
				id="reason"
				bind:value={reason}
				rows={3}
				placeholder="Enter reason for encounter..."
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			></textarea>
		</div>

		<div class="flex justify-end gap-2">
			<button
				type="button"
				onclick={onClose}
				class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
				>Cancel</button
			>
			<button
				type="submit"
				disabled={submitting}
				class="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
				>{submitting ? 'Creating...' : 'Start Encounter'}</button
			>
		</div>
	</form>
</Modal>
