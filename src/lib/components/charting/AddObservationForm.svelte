<script lang="ts">
	import type { Observation } from 'fhir/r4b';
	import { createFHIRResource } from '$lib/fhir';
	import Spinner from '$lib/components/Spinner.svelte';

	export interface ObservationTypeConfig {
		code: string;
		display: string;
	}

	interface Props {
		patientId: string;
		observationType: ObservationTypeConfig;
		onSave?: () => void;
	}

	let { patientId, observationType, onSave }: Props = $props();

	let value = $state('');
	let unit = $state('');
	let valueString = $state('');
	let effectiveDateTime = $state(new Date().toISOString().slice(0, 16));
	let isSubmitting = $state(false);
	let error = $state('');

	const isNumeric = $derived(observationType.code !== '85354-9');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		error = '';

		try {
			const observation: Observation = {
				resourceType: 'Observation',
				status: 'final',
				category: [
					{
						coding: [
							{
							system: 'http://terminology.hl7.org/CodeSystem/observation-category',
							code: 'vital-signs',
							display: 'Vital Signs'
						}
						]
					}
				],
				code: {
					coding: [
						{
							system: 'http://loinc.org',
							code: observationType.code,
							display: observationType.display
						}
					],
					text: observationType.display
				},
				subject: { reference: `Patient/${patientId}` },
				effectiveDateTime: new Date(effectiveDateTime).toISOString()
			};

			if (isNumeric && value) {
				observation.valueQuantity = {
					value: parseFloat(value),
					unit: unit || undefined,
					system: 'http://unitsofmeasure.org',
					code: unit || undefined
				};
			} else if (valueString) {
				observation.valueString = valueString;
			} else if (value) {
				observation.valueQuantity = {
					value: parseFloat(value),
					unit: unit || undefined,
					system: 'http://unitsofmeasure.org',
					code: unit || undefined
				};
			} else {
				throw new Error('Please enter a value');
			}

			await createFHIRResource(observation);
			value = '';
			unit = '';
			valueString = '';
			effectiveDateTime = new Date().toISOString().slice(0, 16);
			onSave?.();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save observation';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form class="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" onsubmit={handleSubmit}>
	<div class="flex items-center justify-between">
		<h4 class="text-sm font-semibold text-gray-900 dark:text-white">
			Add {observationType.display}
		</h4>
		{#if error}
			<span class="text-xs text-red-600 dark:text-red-400">{error}</span>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-3">
		{#if isNumeric}
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="obs-value">Value</label>
				<input
					id="obs-value"
					type="number"
					step="any"
					class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
					bind:value
					placeholder="e.g. 120"
					required
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="obs-unit">Unit</label>
				<input
					id="obs-unit"
					type="text"
					class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
					bind:value={unit}
					placeholder="e.g. mmHg"
				/>
			</div>
		{:else}
			<div class="flex flex-col gap-1 col-span-2">
				<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="obs-string">Value</label>
				<input
					id="obs-string"
					type="text"
					class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
					bind:value={valueString}
					placeholder="Enter value or description"
					required
				/>
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-1">
		<label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="obs-date">Date & Time</label>
		<input
			id="obs-date"
			type="datetime-local"
			class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
			bind:value={effectiveDateTime}
			required
		/>
	</div>

	<div class="flex justify-end">
		<button
			type="submit"
			class="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
			disabled={isSubmitting || (!value && !valueString)}
		>
			{#if isSubmitting}
				<Spinner />
			{/if}
			{isSubmitting ? 'Saving...' : 'Add Observation'}
		</button>
	</div>
</form>
