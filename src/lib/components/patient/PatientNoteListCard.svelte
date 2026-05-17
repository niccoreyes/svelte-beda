<script lang="ts">
	import type { Bundle, DocumentReference } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import PatientDashboardCard from './PatientDashboardCard.svelte';
	import PatientNoteList from './PatientNoteList.svelte';
	import PatientNoteForm from './PatientNoteForm.svelte';
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	let formOpen = $state(false);

	const notesState = createServiceState<Bundle>(async () => {
		return getFHIRResources('DocumentReference', {
			patient: `Patient/${patientId}`,
			_sort: '-date',
			_count: '3'
		});
	});

	$effect(() => {
		if (patientId) notesState.reload();
	});

	const notes = $derived(() => {
		if (notesState.data.status !== 'success') return [];
		const bundle = notesState.data.data;
		return (bundle.entry?.map((e) => e.resource as DocumentReference).filter(Boolean) || []) as DocumentReference[];
	});

	function handleSave() {
		formOpen = false;
		notesState.reload();
	}
</script>

<PatientDashboardCard title="Notes" loading={notesState.data.status === 'loading'}>
	<div class="space-y-3">
		<PatientNoteList {patientId} notes={notes()} />

		<div class="pt-1">
			<button
				onclick={() => (formOpen = true)}
				class="w-full px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add Note
			</button>
		</div>
	</div>
</PatientDashboardCard>

<Modal open={formOpen} title="Add Note" onClose={() => (formOpen = false)}>
	<PatientNoteForm {patientId} onSave={handleSave} onCancel={() => (formOpen = false)} />
</Modal>
