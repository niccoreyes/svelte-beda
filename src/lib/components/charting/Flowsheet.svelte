<script lang="ts">
	import type { Observation, Bundle } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate } from '$lib/utils';
	import Spinner from '$lib/components/Spinner.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import Chart from '$lib/components/Chart.svelte';
	import FlowsheetRow from './FlowsheetRow.svelte';
	import AddObservationForm from './AddObservationForm.svelte';
	import type { ChartData } from 'chart.js';

	export interface ObservationTypeConfig {
		code: string;
		display: string;
	}

	export const DEFAULT_VITAL_SIGNS: ObservationTypeConfig[] = [
		{ code: '85354-9', display: 'Blood Pressure' },
		{ code: '8867-4', display: 'Heart Rate' },
		{ code: '8310-5', display: 'Temperature' },
		{ code: '2708-6', display: 'SpO2' },
		{ code: '29463-7', display: 'Weight' }
	];

	interface Props {
		patientId: string;
		observationTypes?: ObservationTypeConfig[];
	}

	let { patientId, observationTypes = DEFAULT_VITAL_SIGNS }: Props = $props();

	let viewMode = $state<'table' | 'chart'>('table');
	// svelte-ignore state_referenced_locally (intentional initial-value-only; user-selected chart type)
	let selectedChartType = $state(observationTypes[0]?.code || '');

	const observationsState = createServiceState<Bundle>(async () => {
		const codes = observationTypes.map((t) => `http://loinc.org|${t.code}`);
		return getFHIRResources('Observation', {
			patient: `Patient/${patientId}`,
			code: codes.join(','),
			_sort: 'date',
			_count: '100'
		});
	});

	$effect(() => {
		if (patientId) {
			observationsState.reload();
		}
	});

	function getObservationsForType(type: ObservationTypeConfig): Observation[] {
		if (observationsState.data.status !== 'success') return [];
		const bundle = observationsState.data.data;
		const allObs =
			bundle.entry?.map((e) => e.resource as Observation).filter((r): r is Observation => !!r) || [];
		return allObs.filter((obs) =>
			obs.code?.coding?.some((c) => c.code === type.code)
		);
	}

	function getAllDates(): string[] {
		const dates = new Set<string>();
		for (const type of observationTypes) {
			const obs = getObservationsForType(type);
			for (const o of obs) {
				const dt = o.effectiveDateTime || o.issued;
				if (dt) dates.add(humanDate(dt));
			}
		}
		return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
	}

	function getChartData(type: ObservationTypeConfig): ChartData {
		const obs = getObservationsForType(type);
		const sorted = [...obs].sort(
			(a, b) =>
				new Date(a.effectiveDateTime || a.issued || 0).getTime() -
				new Date(b.effectiveDateTime || b.issued || 0).getTime()
		);

		const labels: string[] = [];
		const data: number[] = [];

		for (const o of sorted) {
			const dt = o.effectiveDateTime || o.issued;
			if (!dt) continue;
			if (o.valueQuantity && typeof o.valueQuantity.value === 'number') {
				labels.push(humanDate(dt));
				data.push(o.valueQuantity.value);
			}
		}

		return {
			labels,
			datasets: [
				{
					label: type.display,
					data
				}
			]
		};
	}

	function handleObservationSaved() {
		observationsState.reload();
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<button
				class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
				onclick={() => (viewMode = 'table')}
			>
				Table
			</button>
			<button
				class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {viewMode === 'chart' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
				onclick={() => (viewMode = 'chart')}
			>
				Chart
			</button>
		</div>
	</div>

	{#if observationsState.data.status === 'loading'}
		<div class="flex items-center justify-center h-48">
			<Spinner />
		</div>
	{:else if observationsState.data.status === 'failure'}
		<div class="p-4 text-red-600 dark:text-red-400">
			Error loading observations: {observationsState.data.error?.message || 'Unknown error'}
		</div>
	{:else}
		{@const allDates = getAllDates()}

		{#if viewMode === 'table'}
			<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
				<table class="min-w-full text-sm">
					<thead class="bg-gray-50 dark:bg-gray-800">
						<tr>
							<th class="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
								Observation
							</th>
							{#each allDates as date}
								<th class="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
									{date}
								</th>
							{/each}
							{#if allDates.length === 0}
								<th class="px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">Date</th>
							{/if}
							<th class="px-3 py-2 text-center font-semibold text-primary">Latest</th>
						</tr>
					</thead>
					<tbody>
						{#each observationTypes as type}
							<FlowsheetRow observationType={type} observations={getObservationsForType(type)} />
						{/each}
					</tbody>
				</table>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each observationTypes as type}
					<AddObservationForm
						{patientId}
						observationType={type}
						onSave={handleObservationSaved}
					/>
				{/each}
			</div>
		{:else}
			{@const selectedType = observationTypes.find((t) => t.code === selectedChartType)}
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="chart-type">Chart:</label>
					<select
						id="chart-type"
						class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
						bind:value={selectedChartType}
					>
						{#each observationTypes as type}
							<option value={type.code}>{type.display}</option>
						{/each}
					</select>
				</div>

				{#if selectedType}
					{@const chartData = getChartData(selectedType)}
					{#if chartData.datasets?.[0]?.data && chartData.datasets[0].data.length > 0}
						<div class="h-80">
							<Chart type="line" data={chartData} />
						</div>
					{:else}
						<Empty message="No numeric data available for chart" />
					{/if}
				{/if}
			</div>
		{/if}
	{/if}
</div>
