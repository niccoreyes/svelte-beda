<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources } from '$lib/fhir';
	import { getPatientName, humanDateTime } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import type { Invoice, Bundle, Patient, Practitioner, PractitionerRole } from 'fhir/r4b';

	let searchQuery = $state('');

	const invoiceState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params.status = searchQuery;
		return getFHIRResources<Invoice>('Invoice', params);
	});

	$effect(() => {
		invoiceState.reload();
	});

	function findPatient(invoice: Invoice, bundle: Bundle): Patient | undefined {
		const patientId = invoice.subject?.reference?.split('/')[1];
		return bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Patient' && (e.resource as Patient).id === patientId)?.resource as Patient | undefined;
	}

	function findPractitioner(invoice: Invoice, bundle: Bundle): Practitioner | undefined {
		const participantRef = invoice.recipient?.reference;
		if (!participantRef) return undefined;
		const [type, id] = participantRef.split('/');
		if (type === 'Practitioner') {
			return bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Practitioner' && (e.resource as Practitioner).id === id)?.resource as Practitioner | undefined;
		}
		if (type === 'PractitionerRole') {
			const role = bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'PractitionerRole' && (e.resource as PractitionerRole).id === id)?.resource as PractitionerRole | undefined;
			const pracId = role?.practitioner?.reference?.split('/')[1];
			return bundle.entry?.find((e) => (e.resource as any)?.resourceType === 'Practitioner' && (e.resource as Practitioner).id === pracId)?.resource as Practitioner | undefined;
		}
		return undefined;
	}

	function getPractitionerName(p?: Practitioner): string {
		if (!p) return 'Unknown';
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	function getAmount(invoice: Invoice): string {
		const totalNet = invoice.totalNet?.value;
		const currency = invoice.totalNet?.currency;
		return totalNet && currency ? `${totalNet} ${currency}` : '-';
	}

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Invoices" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'status', label: 'Status', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
			onClearFilters={handleClear}
		/>
	</div>

	{#if invoiceState.data.status === 'loading'}
		<Spinner />
	{:else if invoiceState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {invoiceState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if invoiceState.data.status === 'success'}
		{@const bundle = invoiceState.data.data}
		{@const invoices = bundle.entry?.map((e) => e.resource as Invoice).filter((r): r is Invoice => !!r) || []}
		{#if invoices.length > 0}
			{@const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
				{
					key: 'practitioner',
					header: 'Practitioner',
					cell: (row: unknown) => getPractitionerName(findPractitioner(row as Invoice, bundle))
				},
				{
					key: 'patient',
					header: 'Patient',
					cell: (row: unknown) => {
						const patient = findPatient(row as Invoice, bundle);
						return patient ? getPatientName(patient) : 'Unknown';
					}
				},
				{
					key: 'date',
					header: 'Date',
					cell: (row: unknown) => humanDateTime((row as Invoice).date)
				},
				{
					key: 'status',
					header: 'Status',
					cell: (row: unknown) => (row as Invoice).status || '-'
				},
				{
					key: 'amount',
					header: 'Amount',
					cell: (row: unknown) => getAmount(row as Invoice)
				}
			]}
			<ResourceTable data={invoices} {columns} pageSize={10} loading={invoiceState.isLoading} />
		{:else}
			<Empty message="No invoices found" illustration="document" />
		{/if}
	{/if}
</PageContainer>
