<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { getPatientName, humanDate } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import type { MedicationRequest, Bundle, Patient, Medication, Practitioner } from 'fhir/r4b';

	let searchQuery = $state('');

	const prescriptionState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params['subject:Patient.name:contains'] = searchQuery;
		return getFHIRResources<MedicationRequest>('MedicationRequest', params);
	});

	$effect(() => {
		prescriptionState.reload();
	});

	function findPatient(mr: MedicationRequest, bundle: Bundle): Patient | undefined {
		const patientId = mr.subject?.reference?.split('/')[1];
		return bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Patient' && (e.resource as Patient).id === patientId)?.resource as Patient | undefined;
	}

	function findMedication(mr: MedicationRequest, bundle: Bundle): Medication | undefined {
		const medId = mr.medicationReference?.reference?.split('/')[1];
		return bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Medication' && (e.resource as Medication).id === medId)?.resource as Medication | undefined;
	}

	function findRequester(mr: MedicationRequest, bundle: Bundle): string {
		const ref = mr.requester?.reference;
		if (!ref) return 'Unknown';
		const [type, id] = ref.split('/');
		if (type === 'Practitioner') {
			const p = bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Practitioner' && (e.resource as Practitioner).id === id)?.resource as Practitioner | undefined;
			const name = p?.name?.[0];
			if (name) {
				const given = name.given?.join(' ') || '';
				const family = name.family || '';
				return `${given} ${family}`.trim() || 'Unknown';
			}
		}
		if (type === 'Organization') {
			const org = bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Organization' && (e.resource as { id?: string }).id === id)?.resource as { name?: string } | undefined;
			return org?.name || 'Unknown';
		}
		return ref;
	}

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Prescriptions" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'patient', label: 'Patient', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if prescriptionState.data.status === 'loading'}
		<Spinner />
	{:else if prescriptionState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {prescriptionState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if prescriptionState.data.status === 'success'}
		{@const bundle = prescriptionState.data.data}
		{@const prescriptions = bundle.entry?.map((e) => e.resource as MedicationRequest).filter((r): r is MedicationRequest => !!r) || []}
		{#if prescriptions.length > 0}
			{@const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
				{
					key: 'patient',
					header: 'Patient',
					cell: (row: unknown) => {
						const patient = findPatient(row as MedicationRequest, bundle);
						return patient ? getPatientName(patient) : 'Unknown';
					}
				},
				{
					key: 'requester',
					header: 'Requester',
					cell: (row: unknown) => findRequester(row as MedicationRequest, bundle)
				},
				{
					key: 'medication',
					header: 'Medication',
					cell: (row: unknown) => {
						const mr = row as MedicationRequest;
						const medication = findMedication(mr, bundle);
						return medication?.code?.coding?.[0]?.display || mr.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown';
					}
				},
				{
					key: 'status',
					header: 'Status',
					cell: (row: unknown) => (row as MedicationRequest).status || '-'
				},
				{
					key: 'date',
					header: 'Date',
					cell: (row: unknown) => {
						const mr = row as MedicationRequest;
						return mr.authoredOn ? humanDate(mr.authoredOn) : '-';
					}
				}
			]}
			<ResourceTable data={prescriptions} {columns} pageSize={10} />
		{:else}
			<Empty message="No prescriptions found" />
		{/if}
	{/if}
</PageContainer>
