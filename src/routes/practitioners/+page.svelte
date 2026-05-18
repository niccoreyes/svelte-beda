<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources, deleteFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { serializeFilters } from '$lib/utils/searchParams';
	import BatchActionToolbar from '$lib/components/table/BatchActionToolbar.svelte';
	import HeaderActionButton from '$lib/components/HeaderActionButton.svelte';
	import CreateResourceModal from '$lib/components/CreateResourceModal.svelte';
	import RecordActions from '$lib/components/RecordActions.svelte';
	import type { Component } from 'svelte';
	import BatchActionConfirmModal from '$lib/components/table/BatchActionConfirmModal.svelte';
	import { getCurrentUser } from '$lib/auth/user';
	import { matchCurrentUserRole, Role } from '$lib/auth/permissions';
	import { useTableSorter } from '$lib/utils/tableSorter.svelte';
	import type { Practitioner, Bundle, PractitionerRole } from 'fhir/r4b';

let filters = $state([
	{ id: 'name', label: 'Name', type: 'STRING' as const, value: '', searchParam: 'name' }
]);
let selectedIds = $state<string[]>([]);
let confirmDeleteOpen = $state(false);
let createModalOpen = $state(false);

	const user = getCurrentUser();
	const userRole = user?.role as Role | undefined;

	const canDelete = $derived(matchCurrentUserRole(userRole, Role.Admin));
	const canExport = $derived(true);

	const { sortKey, sortDirection, sortParam, setSort } = useTableSorter({
		resourceType: 'Practitioner',
		initialSortKey: '_lastUpdated',
		initialSortDirection: 'desc'
	});

const practitionerState = createServiceState<Bundle>(async () => {
	const params: Record<string, string | string[]> = { _count: '20' };
	const serialized = serializeFilters(filters);
	Object.assign(params, serialized);
	if (sortParam) {
		params._sort = sortParam;
	} else {
		params._sort = '-_lastUpdated,_id';
	}
	return getFHIRResources<Practitioner>('Practitioner', params);
});

	$effect(() => {
		[filters, sortParam].forEach(() => {});
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
		const roles = bundle.entry?.map((e) => e.resource as PractitionerRole).filter((r): r is PractitionerRole => (r as unknown as Record<string, unknown>)?.resourceType === 'PractitionerRole');
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

	const columns: Array<{
		key: string;
		header: string;
		cell?: (row: unknown) => string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component?: Component<any, any, any>;
		componentProps?: (row: unknown) => Record<string, unknown>;
		filter?: { type: 'text' | 'select'; options?: Array<{ value: string; label: string }>; placeholder?: string };
		sortable?: boolean;
	}> = [
		{
			key: 'name',
			header: 'Name',
			cell: (row: unknown) => {
				const { practitioner } = row as { practitioner: Practitioner };
				return getPractitionerName(practitioner);
			},
			filter: { type: 'text', placeholder: 'Filter name...' },
			sortable: true
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
			component: RecordActions,
			componentProps: (row: unknown) => {
				const { practitioner } = row as { practitioner: Practitioner };
				const id = practitioner.id;
				return {
					actions: [
						{ label: 'View', href: id ? `/practitioners/${id}` : undefined },
						{ label: 'Schedule', href: id ? `/practitioners/${id}` : undefined }
					].filter((a) => Boolean(a.href))
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

function handleFilterChange(id: string, value: string) {
	filters = filters.map(f => f.id === id ? { ...f, value } : f);
}

function handleClear() {
	filters = filters.map(f => ({ ...f, value: '' }));
}
</script>

<PageContainer title="Practitioners" variant="with-table">
	{#snippet titleRightElement()}
		<HeaderActionButton
			label="Add Practitioner"
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
				loading={practitionerState.isLoading}
				sortKey={sortKey ?? null}
				sortDirection={sortDirection}
				onSort={setSort}
				onColumnFilterChange={handleColumnFilterChange}
			/>
		{:else}
			<Empty message="No practitioners found" illustration="search" />
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

<CreateResourceModal
	questionnaireId="practitioner-create"
	open={createModalOpen}
	onClose={() => createModalOpen = false}
	onSuccess={() => {
		createModalOpen = false;
		practitionerState.reload();
	}}
/>
