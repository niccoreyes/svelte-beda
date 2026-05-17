<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources, deleteFHIRResource } from '$lib/fhir';
	import { getPatientName } from '$lib/utils';
	import { createServiceState } from '$lib/state';
	import BatchActionToolbar from '$lib/components/table/BatchActionToolbar.svelte';
	import BatchActionConfirmModal from '$lib/components/table/BatchActionConfirmModal.svelte';
	import { getCurrentUser } from '$lib/auth/user';
	import { matchCurrentUserRole, Role } from '$lib/auth/permissions';
	import type { Patient, Bundle } from 'fhir/r4b';

	let searchQuery = $state('');
	let selectedIds = $state<string[]>([]);
	let confirmDeleteOpen = $state(false);

	const user = getCurrentUser();
	const userRole = user?.role as Role | undefined;

	const canDelete = $derived(matchCurrentUserRole(userRole, Role.Admin));
	const canExport = $derived(true);

	const patientState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _count: '20' };
		if (searchQuery) params.name = searchQuery;
		return getFHIRResources<Patient>('Patient', params);
	});

	$effect(() => {
		searchQuery;
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

	const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => getPatientName(row as Patient)
		},
		{
			key: 'birthDate',
			header: 'Birth Date',
			cell: (row: unknown) => (row as Patient).birthDate || '-'
		},
		{
			key: 'gender',
			header: 'Gender',
			cell: (row: unknown) => (row as Patient).gender || '-'
		},
		{
			key: 'actions',
			header: 'Actions',
			cell: (row: unknown) => {
				const id = (row as Patient).id;
				return id ? `<a href="/patients/${id}" class="text-primary hover:underline">View</a>` : '-';
			}
		}
	];

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

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleClear() {
		searchQuery = '';
	}
</script>

<PageContainer title="Patients" variant="with-table">
	<div class="mb-4">
		<SearchBar
			filters={[
				{ id: 'name', label: 'Name', type: 'STRING', value: searchQuery }
			]}
			onFilterChange={(id, value) => handleSearch(value)}
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
			/>
		{:else}
			<Empty message="No patients found" />
		{/if}
	{/if}
</PageContainer>

<BatchActionConfirmModal
	open={confirmDeleteOpen}
	title="Delete Patients"
	message="Are you sure you want to delete {selectedIds.length} selected patient{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={confirmDelete}
	onCancel={() => (confirmDeleteOpen = false)}
/>
