<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources, deleteFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import BatchActionToolbar from '$lib/components/table/BatchActionToolbar.svelte';
	import BatchActionConfirmModal from '$lib/components/table/BatchActionConfirmModal.svelte';
	import { getCurrentUser } from '$lib/auth/user';
	import { matchCurrentUserRole, Role } from '$lib/auth/permissions';
	import type { Practitioner, Bundle, PractitionerRole } from 'fhir/r4b';

	let searchQuery = $state('');
	let selectedIds = $state<string[]>([]);
	let confirmDeleteOpen = $state(false);

	const user = getCurrentUser();
	const userRole = user?.role as Role | undefined;

	const canDelete = $derived(matchCurrentUserRole(userRole, Role.Admin));
	const canExport = $derived(true);

	const practitionerState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { _sort: '-_lastUpdated,_id', _count: '20' };
		if (searchQuery) params.name = searchQuery;
		return getFHIRResources<Practitioner>('Practitioner', params);
	});

	$effect(() => {
		searchQuery;
		practitionerState.reload();
	});

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}

	function getPractitionerSpecialty(p: Practitioner, bundle: Bundle): string {
		const roles = bundle.entry?.map((e) => e.resource as PractitionerRole).filter((r): r is PractitionerRole => (r as any)?.resourceType === 'PractitionerRole');
		const role = roles?.find((r) => r.practitioner?.reference?.includes(p.id || ''));
		return role?.specialty?.map((s) => s.coding?.[0]?.display || s.text).filter(Boolean).join(', ') || '-';
	}

	function getRowId(row: unknown): string {
		return (row as { practitioner: Practitioner }).practitioner.id || '';
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

	function getCurrentRows(): { practitioner: Practitioner; bundle: Bundle }[] {
		if (practitionerState.data.status !== 'success') return [];
		const bundle = practitionerState.data.data;
		const practitioners = bundle.entry?.map((e) => e.resource as Practitioner).filter((r): r is Practitioner => !!r) || [];
		return practitioners.map((practitioner) => ({ practitioner, bundle }));
	}

	const columns: Array<{ key: string; header: string; cell: (row: unknown) => string }> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => {
				const { practitioner } = row as { practitioner: Practitioner };
				return getPractitionerName(practitioner);
			}
		},
		{
			key: 'specialty',
			header: 'Specialty',
			cell: (row: unknown) => {
				const { practitioner, bundle } = row as { practitioner: Practitioner; bundle: Bundle };
				return getPractitionerSpecialty(practitioner, bundle);
			}
		},
		{
			key: 'actions',
			header: 'Actions',
			cell: (row: unknown) => {
				const id = (row as { practitioner: Practitioner }).practitioner.id;
				return id ? `<a href="/practitioners/${id}" class="text-primary hover:underline">View</a>` : '-';
			}
		}
	];

	function handleDelete() {
		confirmDeleteOpen = true;
	}

	async function confirmDelete() {
		confirmDeleteOpen = false;
		const rows = getCurrentRows();
		const selected = rows.filter((r) => selectedIds.includes(r.practitioner.id || ''));
		for (const { practitioner } of selected) {
			if (practitioner.id) {
				await deleteFHIRResource(practitioner);
			}
		}
		selectedIds = [];
		practitionerState.reload();
	}

	function handleExport() {
		const rows = getCurrentRows();
		const selected = rows.filter((r) => selectedIds.includes(r.practitioner.id || ''));
		if (selected.length === 0) return;

		const headers = ['Name', 'Specialty'];
		const csvRows = selected.map(({ practitioner, bundle }) => [
			getPractitionerName(practitioner),
			getPractitionerSpecialty(practitioner, bundle)
		]);
		const csvContent = [headers, ...csvRows]
			.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
			.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'practitioners.csv';
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

<PageContainer title="Practitioners" variant="with-table">
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

	{#if practitionerState.data.status === 'loading'}
		<Spinner />
	{:else if practitionerState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error: {practitionerState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if practitionerState.data.status === 'success'}
		{@const bundle = practitionerState.data.data}
		{@const practitioners = bundle.entry?.map((e) => e.resource as Practitioner).filter((r): r is Practitioner => !!r) || []}
		{#if practitioners.length > 0}
			{@const rows = practitioners.map((practitioner) => ({ practitioner, bundle }))}
			<ResourceTable
				data={rows}
				{columns}
				pageSize={10}
				{getRowId}
				selectedIds={selectedIds}
				onToggleSelect={handleToggleSelect}
				onSelectAll={handleSelectAll}
				onSelectNone={handleSelectNone}
			/>
		{:else}
			<Empty message="No practitioners found" />
		{/if}
	{/if}
</PageContainer>

<BatchActionConfirmModal
	open={confirmDeleteOpen}
	title="Delete Practitioners"
	message="Are you sure you want to delete {selectedIds.length} selected practitioner{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={confirmDelete}
	onCancel={() => (confirmDeleteOpen = false)}
/>
