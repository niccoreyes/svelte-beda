<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import { getFHIRResource, getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Encounter, Bundle, Patient, Practitioner, Observation, DocumentReference } from 'fhir/r4b';

	import EncounterHeader from '$lib/components/encounter/EncounterHeader.svelte';
	import EncounterNotes from '$lib/components/encounter/EncounterNotes.svelte';
	import AudioRecorder from '$lib/components/encounter/AudioRecorder.svelte';
	import Flowsheet from '$lib/components/charting/Flowsheet.svelte';
	import { humanDateTime } from '$lib/utils';

	const { encounterId, id: patientId } = $page.params;

	const encounterState = createServiceState<Encounter>(async () => {
		return getFHIRResource<Encounter>({ reference: `Encounter/${encounterId}` });
	});

	const patientState = createServiceState<Patient>(async () => {
		return getFHIRResource<Patient>({ reference: `Patient/${patientId}` });
	});

	const practitionerState = createServiceState<Practitioner>(async () => {
		const encounter = encounterState.data;
		if (encounter.status !== 'success') return {} as Practitioner;
		const participant = encounter.data.participant?.[0]?.individual?.reference;
		if (!participant) return {} as Practitioner;
		return getFHIRResource<Practitioner>({ reference: participant });
	});

	const observationsState = createServiceState<Bundle>(async () => {
		return getFHIRResources<Observation>('Observation', { encounter: `Encounter/${encounterId}`, _sort: '-date' });
	});

	const docsState = createServiceState<Bundle>(async () => {
		return getFHIRResources<DocumentReference>('DocumentReference', { encounter: `Encounter/${encounterId}`, _sort: '-date' });
	});

	let activeTab = $state('notes');

	const tabs = [
		{ id: 'notes', label: 'Notes' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'charting', label: 'Charting' },
		{ id: 'documents', label: 'Documents' }
	];

	$effect(() => {
		encounterState.reload();
		patientState.reload();
		observationsState.reload();
		docsState.reload();
	});

	$effect(() => {
		if (encounterState.data.status === 'success') {
			practitionerState.reload();
		}
	});
</script>

{#if encounterState.data.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if encounterState.data.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading encounter: {encounterState.data.error?.message || 'Unknown error'}</p>
	</div>
{:else if encounterState.data.status === 'success'}
	{@const encounter = encounterState.data.data}
	{@const patient = patientState.data.status === 'success' ? patientState.data.data : undefined}
	{@const practitioner = practitionerState.data.status === 'success' ? practitionerState.data.data : undefined}

	<PageContainer title="Encounter Workspace" variant="with-tabs">
		{#snippet headerContent()}
			<EncounterHeader {encounter} {patient} {practitioner} />
			<div class="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mt-4">
			{#each tabs as tab (tab.id)}
				<button
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					onclick={() => activeTab = tab.id}
				>
					{tab.label}
				</button>
			{/each}
			</div>
		{/snippet}

		{#if activeTab === 'notes'}
			<div class="space-y-4">
				<EncounterNotes encounterId={encounterId!} patientId={patientId!} patientName={patient ? `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim() : undefined} />
				<AudioRecorder />
			</div>
		{:else if activeTab === 'timeline'}
			<div class="space-y-4">
				<h3 class="text-base font-semibold">Encounter Timeline</h3>
				{#if observationsState.data.status === 'success'}
					{@const bundle = observationsState.data.data}
					{@const observations = bundle.entry?.map((e) => e.resource as Observation).filter((r): r is Observation => !!r) || []}
					{#if observations.length > 0}
						<div class="relative pl-4 border-l-2 border-[var(--gray-4)] dark:border-[var(--gray-5)] space-y-4">
							{#each observations as obs (obs.id)}
								<div class="relative">
									<div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-[var(--gray-1)] dark:border-[var(--gray-3)]"></div>
									<div class="p-3 bg-[var(--gray-3)] dark:bg-[var(--gray-4)] rounded-lg">
										<p class="text-sm font-medium text-[var(--gray-10)]">{obs.code?.text || obs.code?.coding?.[0]?.display || 'Observation'}</p>
										<p class="text-sm text-[var(--gray-7)]">
											{obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}` : obs.valueString || '-'}
										</p>
										<p class="text-xs text-[var(--gray-6)] mt-1">{obs.effectiveDateTime ? humanDateTime(obs.effectiveDateTime) : '-'}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<Empty message="No observations in timeline" />
					{/if}
				{:else}
					<Spinner />
				{/if}
			</div>
		{:else if activeTab === 'charting'}
			<div class="space-y-4">
				<h3 class="text-base font-semibold">Vital Signs Flowsheet</h3>
				<Flowsheet patientId={patientId!} />
			</div>
		{:else if activeTab === 'documents'}
			<div class="space-y-4">
				{#if docsState.data.status === 'success'}
					{@const bundle = docsState.data.data}
					{@const docs = bundle.entry?.map((e) => e.resource as DocumentReference).filter((r): r is DocumentReference => !!r) || []}
					{#if docs.length > 0}
						<div class="space-y-2">
							{#each docs as doc (doc.id)}
								<div class="p-3 bg-[var(--gray-3)] dark:bg-[var(--gray-4)] rounded-lg">
									<p class="font-medium text-[var(--gray-10)]">{doc.type?.text || doc.type?.coding?.[0]?.display || 'Document'}</p>
									<p class="text-sm text-[var(--gray-7)]">{doc.status} · {doc.date ? humanDateTime(doc.date) : '-'}</p>
								</div>
							{/each}
						</div>
					{:else}
						<Empty message="No documents found" />
					{/if}
				{:else}
					<Spinner />
				{/if}
			</div>
		{/if}
	</PageContainer>
{/if}
