<script lang="ts">
	import type { Patient, Bundle, AllergyIntolerance, Condition } from 'fhir/r4b';
	import { getPatientName, humanDate } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import { getFHIRResources } from '$lib/fhir';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import StartEncounterButton from '$lib/components/encounter/StartEncounterButton.svelte';
	import InlinePatientEdit from './InlinePatientEdit.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { Role } from '$lib/auth/role';
	import { matchCurrentUserRole } from '$lib/auth/permissions';
	import { getCurrentUser } from '$lib/auth/user';

	interface Props {
		patient: Patient;
		onPatientUpdated?: () => void;
	}

	let { patient, onPatientUpdated }: Props = $props();

	const currentUser = getCurrentUser();
	const userRole = currentUser?.role as Role | undefined;
	const isPractitioner = matchCurrentUserRole(userRole, Role.Practitioner, Role.Admin);

	let editModalOpen = $state(false);

	const allergiesState = createServiceState<Bundle>(async () => {
		return getFHIRResources('AllergyIntolerance', { patient: `Patient/${patient.id}` });
	});

	const conditionsState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Condition', { patient: `Patient/${patient.id}` });
	});

	$effect(() => {
		if (patient.id) {
			allergiesState.reload();
			conditionsState.reload();
		}
	});

	const initials = $derived(() => {
		const name = patient.name?.[0];
		if (!name) return '?';
		const given = name.given?.[0]?.[0] || '';
		const family = name.family?.[0] || '';
		return `${given}${family}`.toUpperCase();
	});

	const age = $derived(() => {
		if (!patient.birthDate) return null;
		const birth = new Date(patient.birthDate);
		const today = new Date();
		let a = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
		return a;
	});

	const identifiers = $derived(patient.identifier);
	const telecoms = $derived(patient.telecom);

	function handleEditSave() {
		editModalOpen = false;
		onPatientUpdated?.();
	}
</script>

<div class="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
	<div class="flex items-center gap-4 flex-1 min-w-0">
		<div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
			{initials()}
		</div>
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{getPatientName(patient)}</h2>
				{#if isPractitioner}
					<button
						onclick={() => (editModalOpen = true)}
						class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
						title="Edit patient"
						aria-label="Edit patient"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
					</button>
				{/if}
			</div>
			<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
				<span>{patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '-'}</span>
				{#if patient.birthDate}
					<span>{humanDate(patient.birthDate)} ({age()}y)</span>
				{/if}
				{#if identifiers && identifiers.length > 0}
					<span>MRN: {identifiers[0]?.value || '-'}</span>
				{/if}
				{#if telecoms && telecoms.length > 0}
					<span>{telecoms[0]?.value || '-'}</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex items-center gap-3 shrink-0">
		{#if isPractitioner}
			<StartEncounterButton patientId={patient.id!} variant="default" />
		{/if}

		<RenderRemoteData remoteData={allergiesState.data}>
			{#snippet children(data)}
				{@const bundle = data as Bundle}
				{@const allergies = (bundle.entry?.map((e) => e.resource as AllergyIntolerance).filter(Boolean) || []) as AllergyIntolerance[]}
				<div class="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center min-w-[80px]">
					<p class="text-lg font-semibold text-red-600 dark:text-red-400">{allergies.length}</p>
					<p class="text-xs text-red-600/80 dark:text-red-400/80">Allergies</p>
				</div>
			{/snippet}
			{#snippet renderLoading()}
				<div class="px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center min-w-[80px]">
					<Spinner />
				</div>
			{/snippet}
		</RenderRemoteData>

		<RenderRemoteData remoteData={conditionsState.data}>
			{#snippet children(data)}
				{@const bundle = data as Bundle}
				{@const conditions = (bundle.entry?.map((e) => e.resource as Condition).filter(Boolean) || []) as Condition[]}
				<div class="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center min-w-[80px]">
					<p class="text-lg font-semibold text-blue-600 dark:text-blue-400">{conditions.length}</p>
					<p class="text-xs text-blue-600/80 dark:text-blue-400/80">Conditions</p>
				</div>
			{/snippet}
			{#snippet renderLoading()}
				<div class="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center min-w-[80px]">
					<Spinner />
				</div>
			{/snippet}
		</RenderRemoteData>
	</div>
</div>

<Modal open={editModalOpen} title="Edit Patient" onClose={() => (editModalOpen = false)}>
	<InlinePatientEdit {patient} onSave={handleEditSave} onCancel={() => (editModalOpen = false)} />
</Modal>
