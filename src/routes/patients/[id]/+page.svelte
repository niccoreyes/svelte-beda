<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import { remoteRead } from '$lib/fhir';
	import { getPatientName } from '$lib/utils';
	import { notAsked, loading, type RemoteData } from '$lib/state';
	import type { Patient } from 'fhir/r4b';
	import { Role } from '$lib/auth/role';
	import { matchCurrentUserRole } from '$lib/auth/permissions';
	import { getCurrentUser } from '$lib/auth/user';

	import PatientHeader from '$lib/components/patient/PatientHeader.svelte';
	import DocumentsList from '$lib/components/patient/DocumentsList.svelte';
	import PatientOrders from '$lib/components/patient/PatientOrders.svelte';
	import PatientResources from '$lib/components/patient/PatientResources.svelte';
	import PatientApps from '$lib/components/patient/PatientApps.svelte';
	import PatientWearables from '$lib/components/patient/PatientWearables.svelte';
	import PatientDocumentWizard from '$lib/components/patient/PatientDocumentWizard.svelte';

	import DashboardCardDragDrop from '$lib/components/patient/DashboardCardDragDrop.svelte';
	import AppointmentCard from '$lib/components/patient/AppointmentCard.svelte';
	import GeneralInformationCard from '$lib/components/patient/GeneralInformationCard.svelte';
	import SummaryCard from '$lib/components/patient/SummaryCard.svelte';
	import PatientNoteListCard from '$lib/components/patient/PatientNoteListCard.svelte';
	import ConditionsCard from '$lib/components/patient/ConditionsCard.svelte';
	import AllergiesCard from '$lib/components/patient/AllergiesCard.svelte';
	import MedicationsCard from '$lib/components/patient/MedicationsCard.svelte';
	import ImmunizationsCard from '$lib/components/patient/ImmunizationsCard.svelte';
	import ProceduresCard from '$lib/components/patient/ProceduresCard.svelte';
	import PatientEncounterList from '$lib/components/patient/PatientEncounterList.svelte';
	import StartEncounterModal from '$lib/components/encounter/StartEncounterModal.svelte';

	import {
		defaultPatientDashboardConfig,
		validateConfig,
		type PatientDashboardConfig,
		type DashboardCardType
	} from '$lib/dashboard/patientDashboardConfig';

	let patientState = $state<RemoteData<Patient, Error>>(notAsked());
	let wizardOpen = $state(false);
	let startEncounterOpen = $state(false);

	async function loadPatient(currentId: string) {
		patientState = loading();
		patientState = await remoteRead<Patient>(`Patient/${currentId}`);
	}

	$effect(() => {
		const currentId = $page.params.id;
		if (currentId) {
			loadPatient(currentId);
		}
	});

	let activeTab = $state('overview');

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'encounters', label: 'Encounters' },
		{ id: 'documents', label: 'Documents' },
		{ id: 'orders', label: 'Orders' },
		{ id: 'resources', label: 'Resources' },
		{ id: 'apps', label: 'Apps' },
		{ id: 'wearables', label: 'Wearables' }
	];

	const currentUser = getCurrentUser();
	const userRole = currentUser?.role as Role | undefined;
	const isPractitioner = matchCurrentUserRole(userRole, Role.Practitioner, Role.Admin, Role.Receptionist);

	const CONFIG_KEY = 'beda_patient_dashboard_config';

	function loadDashboardConfig(): PatientDashboardConfig {
		if (typeof window === 'undefined') return defaultPatientDashboardConfig();
		const saved = localStorage.getItem(CONFIG_KEY);
		if (saved) {
			try {
				return validateConfig(JSON.parse(saved));
			} catch {
				return defaultPatientDashboardConfig();
			}
		}
		return defaultPatientDashboardConfig();
	}

	let dashboardConfig = $state<PatientDashboardConfig>(loadDashboardConfig());

	function saveDashboardConfig(config: PatientDashboardConfig) {
		if (typeof window === 'undefined') return;
		localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
	}

	function handleReorder(newCards: PatientDashboardConfig['cards']) {
		dashboardConfig = { cards: newCards };
		saveDashboardConfig(dashboardConfig);
	}
</script>

{#if patientState.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if patientState.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading patient: {patientState.error?.message || 'Unknown error'}</p>
	</div>
{:else if patientState.status === 'success'}
	{@const patient = patientState.data}
	<PageContainer title={getPatientName(patient)} variant="with-tabs">
		{#snippet headerContent()}
			<div class="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
				{#each tabs as tab}
					<button
						class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
						onclick={() => activeTab = tab.id}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		{/snippet}

		{#if activeTab === 'overview'}
			<div class="space-y-4">
				<PatientHeader {patient} onPatientUpdated={() => {
					const currentId = $page.params.id;
					if (currentId) loadPatient(currentId);
				}} />

				{#if isPractitioner}
					<div class="flex justify-end">
						<button
							onclick={() => startEncounterOpen = true}
							class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
						>
							+ Start Encounter
						</button>
					</div>
				{/if}

				<DashboardCardDragDrop cards={dashboardConfig.cards} onReorder={handleReorder}>
					{#snippet children(type: DashboardCardType)}
						{#if type === 'appointments'}
							<AppointmentCard patientId={patient.id!} />
						{:else if type === 'general-info'}
							<GeneralInformationCard {patient} />
						{:else if type === 'summary'}
							<SummaryCard patientId={patient.id!} />
						{:else if type === 'notes'}
							<PatientNoteListCard patientId={patient.id!} />
						{:else if type === 'conditions'}
							<ConditionsCard patientId={patient.id!} />
						{:else if type === 'allergies'}
							<AllergiesCard patientId={patient.id!} />
						{:else if type === 'medications'}
							<MedicationsCard patientId={patient.id!} />
						{:else if type === 'immunizations'}
							<ImmunizationsCard patientId={patient.id!} />
						{:else if type === 'procedures'}
							<ProceduresCard patientId={patient.id!} />
						{/if}
					{/snippet}
				</DashboardCardDragDrop>
			</div>
		{:else if activeTab === 'encounters'}
			<div class="space-y-4">
				{#if isPractitioner}
					<div class="flex justify-end">
						<button
							onclick={() => startEncounterOpen = true}
							class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
						>
							+ Start Encounter
						</button>
					</div>
				{/if}
				<PatientEncounterList patientId={patient.id!} />
			</div>
		{:else if activeTab === 'documents'}
			<div class="space-y-4">
				<div class="flex justify-end">
					<button
						onclick={() => wizardOpen = true}
						class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
					>
						+ New Document
					</button>
				</div>
				<DocumentsList patientId={patient.id!} />
			</div>
		{:else if activeTab === 'orders'}
			<PatientOrders patientId={patient.id!} />
		{:else if activeTab === 'resources'}
			<PatientResources patientId={patient.id!} />
		{:else if activeTab === 'apps'}
			<PatientApps patientId={patient.id!} />
		{:else if activeTab === 'wearables'}
			<PatientWearables patientId={patient.id!} />
		{:else}
			<Empty message="{activeTab} coming soon" />
		{/if}
	</PageContainer>

	<PatientDocumentWizard
		patientId={patient.id!}
		patientName={getPatientName(patient)}
		open={wizardOpen}
		onClose={() => wizardOpen = false}
		onSaved={() => {
			if (activeTab === 'documents') {
				wizardOpen = false;
			}
		}}
	/>

	<StartEncounterModal
		open={startEncounterOpen}
		patientId={patient.id!}
		onClose={() => startEncounterOpen = false}
	/>
{/if}
