<script lang="ts">
	import { PageContainer, ResourceTable, SearchBar, Spinner, Empty } from '$lib/components';
	import { getFHIRResources, updateFHIRResource, deleteFHIRResource } from '$lib/fhir';
import { getPatientName, formatPeriodDateTime, parseFHIRReference, extractBundleResources } from '$lib/utils';
import { serializeFilters } from '$lib/utils/searchParams';
import { createServiceState } from '$lib/state';
import VideoCallModal from '$lib/components/VideoCallModal.svelte';
import HeaderActionButton from '$lib/components/HeaderActionButton.svelte';
import CreateResourceModal from '$lib/components/CreateResourceModal.svelte';
	import RecordActions from '$lib/components/RecordActions.svelte';
	import BatchActionToolbar from '$lib/components/table/BatchActionToolbar.svelte';
	import BatchActionConfirmModal from '$lib/components/table/BatchActionConfirmModal.svelte';
	import { getCurrentUser } from '$lib/auth/user';
	import { matchCurrentUserRole, Role } from '$lib/auth/permissions';
	import { useTableSorter } from '$lib/utils/tableSorter.svelte';
	import type { Encounter, Bundle, Patient, Practitioner, PractitionerRole } from 'fhir/r4b';

let filters = $state([
	{ id: 'patient', label: 'Patient', type: 'REFERENCE' as const, value: '', resourceType: 'Patient', searchParam: 'subject', placeholder: 'Search patient...' },
	{ id: 'practitioner', label: 'Practitioner', type: 'STRING' as const, value: '', searchParam: 'participant', placeholder: 'Search practitioner...' },
	{ id: 'date', label: 'Date', type: 'DATE' as const, value: '', searchParam: 'date' }
]);
let videoCallOpen = $state(false);
let selectedEncounterId = $state<string | null>(null);
let selectedIds = $state<string[]>([]);
let confirmDeleteOpen = $state(false);
let confirmFinishOpen = $state(false);
let createModalOpen = $state(false);

	const user = getCurrentUser();
	const userRole = user?.role as Role | undefined;
	const roomName = $derived(selectedEncounterId ? `beda-encounter-${selectedEncounterId}` : '');

const canFinish = $derived(matchCurrentUserRole(userRole, Role.Practitioner, Role.Admin));
const canDelete = $derived(matchCurrentUserRole(userRole, Role.Admin));
const canExport = $derived(true);
const canCreateEncounter = $derived(matchCurrentUserRole(userRole, Role.Practitioner, Role.Admin));

	function openVideoCall(encounterId: string) {
		selectedEncounterId = encounterId;
		videoCallOpen = true;
	}

	function closeVideoCall() {
		videoCallOpen = false;
		selectedEncounterId = null;
	}

	const { sortKey, sortDirection, sortParam, setSort } = useTableSorter({
		resourceType: 'Encounter',
		initialSortKey: 'date',
		initialSortDirection: 'desc'
	});

	let columnFilterValues = $state<Record<string, string>>({});

const encounterState = createServiceState<Bundle>(async () => {
	const params: Record<string, string | string[]> = {
		_count: '20',
		'_include:iterate': [
			'Encounter:subject',
			'Encounter:participant:PractitionerRole',
			'Encounter:participant:Practitioner',
			'PractitionerRole:practitioner:Practitioner'
		]
	};
	const serialized = serializeFilters(filters);
	Object.assign(params, serialized);
	if (columnFilterValues.patient) {
		params['subject.name'] = columnFilterValues.patient;
	}
	if (sortParam) {
		params._sort = sortParam;
	} else {
		params._sort = '-date,_id';
	}
	return getFHIRResources<Encounter>('Encounter', params);
});

$effect(() => {
	filters;
	columnFilterValues;
	sortParam;
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
			key: 'patient',
			header: 'Patient',
			cell: (row: unknown) => {
				const { encounter, bundle } = row as { encounter: Encounter; bundle: Bundle };
				return getEncounterPatientName(encounter, bundle);
			},
			filter: { type: 'text', placeholder: 'Filter patient...' }
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
			cell: (row: unknown) => (row as { encounter: Encounter }).encounter.status || '-',
			sortable: true
		},
		{
			key: 'date',
			header: 'Date',
			cell: (row: unknown) => formatPeriod((row as { encounter: Encounter }).encounter.period),
			filter: { type: 'text', placeholder: 'Filter date...' },
			sortable: true
		},
		{
			key: 'actions',
			header: 'Actions',
			component: RecordActions,
			componentProps: (row: unknown) => {
				const { encounter, bundle } = row as { encounter: Encounter; bundle: Bundle };
				const id = encounter.id;
				const { patient } = getEncounterData(encounter, bundle);
				return {
					actions: [
						{
							label: 'Open',
							href: id && patient?.id ? `/patients/${patient.id}/encounters/${id}` : undefined
						},
						{ label: 'Video Call', onClick: id ? () => openVideoCall(id) : undefined }
					].filter((a) => Boolean(a.href || a.onClick))
				};
			}
		}
	];

	function handleColumnFilterChange(key: string, value: string) {
		if (key === 'patient') {
			columnFilterValues = { ...columnFilterValues, patient: value };
		} else if (key === 'date') {
			filters = filters.map((f) => (f.id === 'date' ? { ...f, value } : f));
		}
	}

	function getRowId(row: unknown): string {
		return (row as { encounter: Encounter }).encounter.id || '';
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

	function getCurrentRows(): unknown[] {
		if (encounterState.data.status !== 'success') return [];
		const bundle = encounterState.data.data;
		const encounters = bundle.entry?.map((e) => e.resource as Encounter).filter((r): r is Encounter => !!r) || [];
		return encounters.map((encounter) => ({ encounter, bundle }));
	}

	function handleFinish() {
		confirmFinishOpen = true;
	}

	async function confirmFinish() {
		confirmFinishOpen = false;
		const rows = getCurrentRows() as { encounter: Encounter }[];
		const selected = rows.filter((r) => selectedIds.includes(r.encounter.id || ''));
		for (const { encounter } of selected) {
			if (encounter.id) {
				await updateFHIRResource({ ...encounter, status: 'finished' });
			}
		}
		selectedIds = [];
		encounterState.reload();
	}

	function handleDelete() {
		confirmDeleteOpen = true;
	}

	async function confirmDelete() {
		confirmDeleteOpen = false;
		const rows = getCurrentRows() as { encounter: Encounter }[];
		const selected = rows.filter((r) => selectedIds.includes(r.encounter.id || ''));
		for (const { encounter } of selected) {
			if (encounter.id) {
				await deleteFHIRResource(encounter);
			}
		}
		selectedIds = [];
		encounterState.reload();
	}

	function handleExport() {
		const rows = getCurrentRows() as { encounter: Encounter; bundle: Bundle }[];
		const selected = rows.filter((r) => selectedIds.includes(r.encounter.id || ''));
		if (selected.length === 0) return;

		const headers = ['Patient', 'Practitioner', 'Status', 'Date'];
		const csvRows = selected.map(({ encounter, bundle }) => [
			getEncounterPatientName(encounter, bundle),
			getEncounterPractitionerName(encounter, bundle),
			encounter.status || '',
			formatPeriod(encounter.period)
		]);
		const csvContent = [headers, ...csvRows]
			.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
			.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'encounters.csv';
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

<PageContainer title="Encounters" variant="with-table">
	{#snippet titleRightElement()}
		{#if canCreateEncounter}
			<HeaderActionButton
				label="New Encounter"
				onClick={() => createModalOpen = true}
			>
				{#snippet icon()}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				{/snippet}
			</HeaderActionButton>
		{/if}
		<HeaderActionButton
			label="Start Video Call"
			onClick={() => openVideoCall('general')}
		>
			{#snippet icon()}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
		onFinish={canFinish ? handleFinish : undefined}
		onDelete={canDelete ? handleDelete : undefined}
		onExport={canExport ? handleExport : undefined}
		{canFinish}
		{canDelete}
		{canExport}
	/>

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
			<ResourceTable
				data={rows}
				{columns}
				pageSize={10}
				{getRowId}
				selectedIds={selectedIds}
				onToggleSelect={handleToggleSelect}
				onSelectAll={handleSelectAll}
				onSelectNone={handleSelectNone}
				loading={encounterState.isLoading}
				sortKey={sortKey ?? null}
				sortDirection={sortDirection}
				onSort={setSort}
				onColumnFilterChange={handleColumnFilterChange}
			/>
		{:else}
			<Empty message="No encounters found" illustration="calendar" />
		{/if}
	{/if}
</PageContainer>

<CreateResourceModal
	questionnaireId="encounter-create"
	open={createModalOpen}
	onClose={() => createModalOpen = false}
	onSuccess={() => {
		createModalOpen = false;
		encounterState.reload();
	}}
/>

<VideoCallModal
	open={videoCallOpen}
	{roomName}
	userName={user?.name || 'Clinician'}
	onClose={closeVideoCall}
/>

<BatchActionConfirmModal
	open={confirmDeleteOpen}
	title="Delete Encounters"
	message="Are you sure you want to delete {selectedIds.length} selected encounter{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={confirmDelete}
	onCancel={() => (confirmDeleteOpen = false)}
/>

<BatchActionConfirmModal
	open={confirmFinishOpen}
	title="Finish Encounters"
	message="Are you sure you want to finish {selectedIds.length} selected encounter{selectedIds.length === 1 ? '' : 's'}?"
	confirmLabel="Finish"
	onConfirm={confirmFinish}
	onCancel={() => (confirmFinishOpen = false)}
/>
