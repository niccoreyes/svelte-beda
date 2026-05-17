<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources, deleteFHIRResource } from '$lib/fhir';
import { getPatientName } from '$lib/utils';
import { serializeFilters } from '$lib/utils/searchParams';
import { createServiceState } from '$lib/state';
import BatchActionToolbar from '$lib/components/table/BatchActionToolbar.svelte';
import HeaderActionButton from '$lib/components/HeaderActionButton.svelte';
import CreateResourceModal from '$lib/components/CreateResourceModal.svelte';
	import BatchActionConfirmModal from '$lib/components/table/BatchActionConfirmModal.svelte';
	import RecordActions from '$lib/components/RecordActions.svelte';
	import InlinePatientEdit from '$lib/components/patient/InlinePatientEdit.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { getCurrentUser } from '$lib/auth/user';
	import { matchCurrentUserRole, Role } from '$lib/auth/permissions';
	import { useTableSorter } from '$lib/utils/tableSorter.svelte';
	import type { Patient, Bundle } from 'fhir/r4b';

let filters = $state([
	{ id: 'name', label: 'Name', type: 'SPLITSTRING' as const, value: '', delimiter: ' ', searchBehavior: 'AND' as const, searchParam: 'name' }
]);
let selectedIds = $state<string[]>([]);
let confirmDeleteOpen = $state(false);
let createModalOpen = $state(false);
	let editPatient = $state<Patient | null>(null);
	let editModalOpen = $state(false);

	const user = getCurrentUser();
	const userRole = user?.role as Role | undefined;

	const canDelete = $derived(matchCurrentUserRole(userRole, Role.Admin));
	const canExport = $derived(true);

	const { sortKey, sortDirection, sortParam, setSort } = useTableSorter({
		resourceType: 'Patient',
		initialSortKey: '_lastUpdated',
		initialSortDirection: 'desc'
	});

const patientState = createServiceState<Bundle>(async () => {
	const params: Record<string, string | string[]> = { _count: '20' };
	const serialized = serializeFilters(filters);
	Object.assign(params, serialized);
	if (sortParam) {
		let sp = sortParam;
		if (sortKey === 'birthDate') {
			sp = sortDirection === 'desc' ? '-birthdate' : 'birthdate';
		}
		params._sort = sp;
	} else {
		params._sort = '-_lastUpdated,_id';
	}
	return getFHIRResources<Patient>('Patient', params);
});

$effect(() => {
	filters;
	sortParam;
	patientState.reload();
});

	function getRowId(row: unknown): string {
		return (row as Patient).id || '';
	}

	function handleToggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((sid) => sid !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleSelectAll() {
		const rows = getCurrentRows();
		const ids = rows.map(getRowId).filter(Boolean);
		selectedIds = [...new Set([...selectedIds, ...ids])];
	}

	function handleSelectNone() {
		const rows = getCurrentRows();
		const ids = rows.map(getRowId).filter(Boolean);
		selectedIds = selectedIds.filter((sid) => !ids.includes(sid));
	}

	function getCurrentRows(): Patient[] {
		if (patientState.data.status !== 'success') return [];
		const bundle = patientState.data.data;
		return bundle.entry?.map((e) => e.resource as Patient).filter((r): r is Patient => !!r) || [];
	}

	function openEdit(patient: Patient) {
		editPatient = patient;
		editModalOpen = true;
	}

	function closeEdit() {
		editPatient = null;
		editModalOpen = false;
	}

	function handleEditSave(saved: Patient) {
		editPatient = null;
		editModalOpen = false;
		patientState.reload();
	}

	const columns: Array<{
		key: string;
		header: string;
		cell?: (row: unknown) => string;
		component?: any;
		componentProps?: (row: unknown) => Record<string, any>;
		filter?: { type: 'text' | 'select'; options?: Array<{ value: string; label: string }>; placeholder?: string };
		sortable?: boolean;
	}> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => getPatientName(row as Patient),
			filter: { type: 'text', placeholder: 'Filter name...' },
			sortable: true
		},
		{
			key: 'birthDate',
			header: 'Birth Date',
			cell: (row: unknown) => (row as Patient).birthDate || '-',
			sortable: true
		},
		{
			key: 'gender',
			header: 'Gender',
			cell: (row: unknown) => (row as Patient).gender || '-'
		},
		{
			key: 'actions',
			header: 'Actions',
			component: RecordActions,
			componentProps: (row: unknown) => {
				const patient = row as Patient;
				const id = patient.id;
				return {
					actions: [
						{ label: 'View', href: id ? `/patients/${id}` : undefined },
						{ label: 'Chart', href: id ? `/patients/${id}/encounters` : undefined },
						{ label: 'Forms', href: id ? `/patients/${id}/documents` : undefined },
						{ label: 'Edit', onClick: id ? () => openEdit(patient) : undefined }
					].filter((a) => Boolean(a.href || a.onClick))
				};
			}
		}
	];

	function handleColumnFilterChange(key: string, value: string) {
		if (key === 'name') {
			filters = filters.map((f) => (f.id === 'name' ? { ...f, value } : f));
		}
	}

	function handleDelete() {
		confirmDeleteOpen = true;
	}

	async function confirmDelete() {
		confirmDeleteOpen = false;
		const rows = getCurrentRows();
		const selected = rows.filter((r) => selectedIds.includes(r.id || ''));
		for (const patient of selected) {
			if (patient.id) {
				await deleteFHIRResource(patient);
			}
		}
		selectedIds = [];
		patientState.reload();
	}

	function handleExport() {
		const rows = getCurrentRows();
		const selected = rows.filter((r) => selectedIds.includes(r.id || ''));
		if (selected.length === 0) return;

		const headers = ['Name', 'Birth Date', 'Gender'];
		const csvRows = selected.map((patient) => [
			getPatientName(patient),
			patient.birthDate || '',
			patient.gender || ''
		]);
		const csvContent = [headers, ...csvRows]
			.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
			.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'patients.csv';
		link.click();
		URL.revokeObjectURL(url);
		selectedIds = [];
	}

function handleFilterChange(id: string, value: string) {
	filters = filters.map(f => f.id === id ? { ...f, value } : f);
}

function handleClear() {
	filters = filters.map(f => ({ ...f, value: '' }));
}
</script>

<PageContainer title="Patients" variant="with-table">
	{#snippet titleRightElement()}
		<HeaderActionButton
			label="Add Patient"
			onClick={() => createModalOpen = true}
		>
			{#snippet icon()}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			{/snippet}
		</HeaderActionButton>
	{/snippet}
	<div class="mb-4">
		<SearchBar
			{filters}
			onFilterChange={handleFilterChange}
			onClearFilters={handleClear}
		/>
	</div>

	<BatchActionToolbar
		count={selectedIds.length}
		onDelete={canDelete ? handleDelete : undefined}
		onExport={canExport ? handleExport : undefined}
		canFinish={false}
		{canDelete}
		{canExport}
	/>

	{#if patientState.data.status === 'loading'}
		<Spinner />
	{:else if patientState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {patientState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if patientState.data.status === 'success'}
		{@const bundle = patientState.data.data}
		{@const patients = bundle.entry?.map((e) => e.resource as Patient).filter((r): r is Patient => !!r) || []}
		{#if patients.length > 0}
			<ResourceTable
				data={patients}
				{columns}
				pageSize={10}
				{getRowId}
				selectedIds={selectedIds}
				onToggleSelect={handleToggleSelect}
				onSelectAll={handleSelectAll}
				onSelectNone={handleSelectNone}
				loading={patientState.isLoading}
				sortKey={sortKey ?? null}
				sortDirection={sortDirection}
				onSort={setSort}
				onColumnFilterChange={handleColumnFilterChange}
			/>
		{:else}
			<Empty message="No patients found" illustration="patient" />
		{/if}
	{/if}
</PageContainer>

{#if editPatient}
	<Modal open={editModalOpen} title="Edit Patient" onClose={closeEdit}>
		<InlinePatientEdit patient={editPatient} onSave={handleEditSave} onCancel={closeEdit} />
	</Modal>
{/if}

<BatchActionConfirmModal
	open={confirmDeleteOpen}
	title="Delete Patients"
	message="Are you sure you want to delete {selectedIds.length} selected patient{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={confirmDelete}
	onCancel={() => (confirmDeleteOpen = false)}
/>

<CreateResourceModal
	questionnaireId="patient-create"
	open={createModalOpen}
	onClose={() => createModalOpen = false}
	onSuccess={() => {
		createModalOpen = false;
		patientState.reload();
	}}
/>
