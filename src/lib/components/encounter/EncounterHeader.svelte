<script lang="ts">
	import type { Encounter, Patient, Practitioner } from 'fhir/r4b';
	import { getPatientName, humanDateTime } from '$lib/utils';
	import EncounterStatusBadge from '$lib/components/EncounterStatusBadge.svelte';

	interface Props {
		encounter: Encounter;
		patient?: Patient;
		practitioner?: Practitioner;
	}

	let { encounter, patient, practitioner }: Props = $props();

	const patientName = $derived(patient ? getPatientName(patient) : encounter.subject?.display || 'Unknown Patient');
	const practitionerName = $derived(practitioner ? getPatientName(practitioner) : encounter.participant?.[0]?.individual?.display || '-');
	const periodText = $derived(() => {
		if (!encounter.period?.start) return '-';
		const start = humanDateTime(encounter.period.start);
		const end = encounter.period.end ? humanDateTime(encounter.period.end) : null;
		return end ? `${start} – ${end}` : start;
	});
</script>

<div class="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-3 flex-wrap">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">{patientName}</h2>
			<EncounterStatusBadge status={encounter.status || 'unknown'} />
		</div>
		<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
			<span>{encounter.class?.display || encounter.class?.code || 'Encounter'}</span>
			<span>{periodText()}</span>
			<span>Practitioner: {practitionerName}</span>
		</div>
	</div>
	{#if encounter.reasonCode && encounter.reasonCode.length > 0}
		<div class="shrink-0">
			<span class="inline-block px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
				{encounter.reasonCode.map((r) => r.text || r.coding?.[0]?.display).filter(Boolean).join(', ')}
			</span>
		</div>
	{/if}
</div>
