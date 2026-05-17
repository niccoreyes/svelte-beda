<script lang="ts">
	import type { HealthcareService, Practitioner } from 'fhir/r4b';
	import type { TimeSlot } from '$lib/calendar/availability';
	import { format } from 'date-fns';
	import Spinner from '$lib/components/Spinner.svelte';

	interface PatientInfo {
		givenName: string;
		familyName: string;
		phone: string;
		email: string;
	}

	interface Props {
		service: HealthcareService;
		practitioner: Practitioner;
		slot: TimeSlot;
		patientInfo: PatientInfo;
		onConfirm: () => void;
		saving?: boolean;
		error?: string | null;
	}

	let { service, practitioner, slot, patientInfo, onConfirm, saving = false, error = null }: Props = $props();

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}
</script>

<div class="max-w-lg mx-auto space-y-6">
	<div class="space-y-3">
		<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
			<p class="text-sm text-gray-500 dark:text-gray-400">Service</p>
			<p class="font-medium text-gray-900 dark:text-white">{service.name || 'Unnamed Service'}</p>
			{#if service.type?.[0]?.text}
				<p class="text-xs text-gray-500 dark:text-gray-400">{service.type[0].text}</p>
			{/if}
		</div>

		<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
			<p class="text-sm text-gray-500 dark:text-gray-400">Practitioner</p>
			<p class="font-medium text-gray-900 dark:text-white">{getPractitionerName(practitioner)}</p>
		</div>

		<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
			<p class="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
			<p class="font-medium text-gray-900 dark:text-white">
				{format(slot.start, 'EEEE, MMMM d, yyyy')}
			</p>
			<p class="text-sm text-gray-700 dark:text-gray-300">
				{format(slot.start, 'h:mm a')} — {format(slot.end, 'h:mm a')}
			</p>
		</div>

		<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
			<p class="text-sm text-gray-500 dark:text-gray-400">Patient</p>
			<p class="font-medium text-gray-900 dark:text-white">
				{patientInfo.givenName} {patientInfo.familyName}
			</p>
			{#if patientInfo.phone}
				<p class="text-sm text-gray-700 dark:text-gray-300">{patientInfo.phone}</p>
			{/if}
			{#if patientInfo.email}
				<p class="text-sm text-gray-700 dark:text-gray-300">{patientInfo.email}</p>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
			{error}
		</div>
	{/if}

	<div class="flex justify-center">
		<button
			onclick={onConfirm}
			disabled={saving}
			class="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
		>
			{#if saving}
				<Spinner />
			{/if}
			{saving ? 'Confirming...' : 'Confirm Appointment'}
		</button>
	</div>
</div>
