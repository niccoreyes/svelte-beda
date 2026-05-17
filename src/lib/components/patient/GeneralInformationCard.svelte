<script lang="ts">
	import type { Patient } from 'fhir/r4b';
	import { getPatientName, humanDate } from '$lib/utils';
	import PatientDashboardCard from './PatientDashboardCard.svelte';

	interface Props {
		patient: Patient;
	}

	let { patient }: Props = $props();
</script>

<PatientDashboardCard title="General Information">
	<div class="space-y-2">
		<div class="flex justify-between">
			<span class="text-sm text-gray-500 dark:text-gray-400">Name</span>
			<span class="text-sm font-medium text-gray-900 dark:text-white">{getPatientName(patient)}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-sm text-gray-500 dark:text-gray-400">Birth Date</span>
			<span class="text-sm font-medium text-gray-900 dark:text-white">{humanDate(patient.birthDate) || '-'}</span>
		</div>
		<div class="flex justify-between">
			<span class="text-sm text-gray-500 dark:text-gray-400">Gender</span>
			<span class="text-sm font-medium text-gray-900 dark:text-white"
				>{patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '-'}</span
			>
		</div>
		{#if patient.address && patient.address.length > 0}
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">Address</span>
				<span
					class="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]"
				>
					{patient.address
						.map((a) =>
							[a.line?.join(', '), a.city, a.state, a.postalCode, a.country]
								.filter(Boolean)
								.join(', ')
						)
						.join('; ')}
					</span
				>
			</div>
		{/if}
		{#if patient.telecom && patient.telecom.length > 0}
			<div class="flex justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">Contact</span>
				<span class="text-sm font-medium text-gray-900 dark:text-white"
					>{patient.telecom.map((t) => `${t.system}: ${t.value}`).join(', ')}</span
				>
			</div>
		{/if}
	</div>
</PatientDashboardCard>
