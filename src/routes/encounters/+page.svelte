<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { getPatientName, formatPeriodDateTime, parseFHIRReference, extractBundleResources } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import type { Encounter, Bundle, Patient, Practitioner, PractitionerRole } from 'fhir/r4b';

	let searchQuery = $state('');

	const encounterState = createServiceState<Bundle>(async () => {
		const params: Record<string, string | string[]> = {
			_sort: '-date,_id',
			_count: '20',
			'_include:iterate': [
				'Encounter:subject',
				'Encounter:participant:PractitionerRole',
				'Encounter:participant:Practitioner',
				'PractitionerRole:practitioner:Practitioner'
			]
		};
		if (searchQuery) params['subject:Patient.name:contains'] = searchQuery;
		return getFHIRResources<Encounter>('Encounter', params);
	});

	$effect(() => {
		searchQuery;
		encounterState.reload();
	});

	function getEncounterData(encounter: Encounter, bundle: Bundle) {
		const sourceMap = extractBundleResources(bundle);
		const patients = (sourceMap.Patient || []) as Patient[];
		const practitioners = (sourceMap.Practitioner || []) as Practitioner[];
		const practitionerRoles = (sourceMap.PractitionerRole || []) as PractitionerRole[];

		const patient = patients.find(
			(p) => encounter.subject && p.id === parseFHIRReference(encounter.subject).id
		);

		const individualRef = encounter.participant?.[0]?.individual;
		let practitioner: Practitioner | undefined;
		if (individualRef) {
			const { resourceType, id } = parseFHIRReference(individualRef);
			if (resourceType === 'PractitionerRole') {
				const practitionerRole = practitionerRoles.find((pr) => pr.id === id);
				if (practitionerRole?.practitioner) {
					const practitionerRef = parseFHIRReference(practitionerRole.practitioner);
					practitioner = practitioners.find((p) => p.id === practitionerRef.id);
				}
			} else if (resourceType === 'Practitioner') {
				practitioner = practitioners.find((p) => p.id === id);
			}
		}

		return { patient, practitioner };
	}

	function getEncounterPatientName(encounter: Encounter, bundle: Bundle): string {
		const { patient } = getEncounterData(encounter, bundle);
		return patient ? getPatientName(patient) : 'Unknown';
	}

	function getEncounterPractitionerName(encounter: Encounter, bundle: Bundle): string {
		const { practitioner } = getEncounterData(encounter, bundle);
		if (!practitioner?.name?.[0]) return 'Unknown';
		const given = practitioner.name[0].given?.join(' ') || '';
		const family = practitioner.name[0].family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	function formatPeriod(period?: { start?: string; end?: string }): string {
		return formatPeriodDateTime(period);
	}

	const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
		{
			key: 'patient',
			header: 'Patient',
			cell: (row: unknown) => {
				const { encounter, bundle } = row as { encounter: Encounter; bundle: Bundle };
				return getEncounterPatientName(encounter, bundle);
			}
		},
		{
			key: 'practitioner',
			header: 'Practitioner',
			cell: (row: unknown) => {
				const { encounter, bundle } = row as { encounter: Encounter; bundle: Bundle };
				return getEncounterPractitionerName(encounter, bundle);
			}
		},
		{
			key: 'status',
			header: 'Status',
			cell: (row: unknown) => (row as { encounter: Encounter }).encounter.status || '-'
		},
		{
			key: 'date',
			header: 'Date',
			cell: (row: unknown) => formatPeriod((row as { encounter: Encounter }).encounter.period)
		}
	];

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Encounters" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'patient', label: 'Patient', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if encounterState.data.status === 'loading'}
		<Spinner />
	{:else if encounterState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {encounterState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if encounterState.data.status === 'success'}
		{@const bundle = encounterState.data.data}
		{@const encounters = bundle.entry?.map((e) => e.resource as Encounter).filter((r): r is Encounter => !!r) || []}
		{#if encounters.length > 0}
			{@const rows = encounters.map((encounter) => ({ encounter, bundle }))}
			<ResourceTable data={rows} {columns} pageSize={10} />
		{:else}
			<Empty message="No encounters found" />
		{/if}
	{/if}
</PageContainer>
