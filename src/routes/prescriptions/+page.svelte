<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
import { getFHIRResources } from '$lib/fhir';
import { getPatientName, humanDate } from '$lib/utils';
import { serializeFilters } from '$lib/utils/searchParams';
import { createServiceState } from '$lib/state';
	import type { MedicationRequest, Bundle, Patient, Medication, Practitioner } from 'fhir/r4b';

let filterValues = $state<Record<string, string>>({
	patient: '',
	status: '[]'
});

const filters = $derived([
	{ id: 'patient', label: 'Patient', type: 'STRING' as const, value: filterValues.patient, placeholder: 'Search patient name...', searchParam: 'subject:Patient.name:contains' },
	{ id: 'status', label: 'Status', type: 'SELECTCHOICE' as const, value: filterValues.status, searchParam: 'status', options: [
		{ value: 'active', label: 'Active' },
		{ value: 'on-hold', label: 'On Hold' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'stopped', label: 'Stopped' },
		{ value: 'draft', label: 'Draft' }
	]}
]);

const prescriptionState = createServiceState<Bundle>(async () => {
	const params: Record<string, string | string[]> = { _sort: '-_lastUpdated,_id', _count: '20' };
	const serialized = serializeFilters(filters);
	Object.assign(params, serialized);
	return getFHIRResources<MedicationRequest>('MedicationRequest', params);
});

$effect(() => {
	filters;
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

	function handleFilterChange(id: string, value: string) {
		filterValues = { ...filterValues, [id]: value };
	}

	function handleClear() {
		filterValues = { patient: '', status: '[]' };
	}
</script>

<PageContainer title="Prescriptions" variant="with-table">
	<div class="mb-4 flex items-center justify-between">
		<SearchBar
			{filters}
			onFilterChange={handleFilterChange}
			onClearFilters={handleClear}
		/>
		<a href="/questionnaires/builder" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
			+ Add Questionnaire
		</a>
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
			<ResourceTable data={prescriptions} {columns} pageSize={10} loading={prescriptionState.isLoading} />
		{:else}
			<Empty message="No prescriptions found" illustration="document" />
		{/if}
	{/if}
</PageContainer>
