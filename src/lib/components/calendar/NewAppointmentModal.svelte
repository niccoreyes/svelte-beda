<script lang="ts">
	import type { Appointment, Patient, Practitioner, HealthcareService } from 'fhir/r4b';
	import Modal from '$lib/components/Modal.svelte';
	import { createAppointment } from '$lib/calendar/appointment';
	import { format } from 'date-fns';

	interface Props {
		open?: boolean;
		patients?: Patient[];
		practitioners?: Practitioner[];
		services?: HealthcareService[];
		initialDate?: string;
		initialEndDate?: string;
		onClose?: () => void;
		onCreated?: (appointment: Appointment) => void;
	}

	let {
		open = false,
		patients = [],
		practitioners = [],
		services = [],
		initialDate,
		initialEndDate,
		onClose,
		onCreated
	}: Props = $props();

	let selectedPatientId = $state('');
	let selectedPractitionerId = $state('');
	let selectedServiceId = $state('');
	let dateValue = $state('');
	let endDateValue = $state('');
	let description = $state('');
	let status = $state<Appointment['status']>('proposed');
	let isSubmitting = $state(false);
	let error = $state('');

	$effect(() => {
		if (open) {
			selectedPatientId = '';
			selectedPractitionerId = '';
			selectedServiceId = '';
			dateValue = initialDate ? format(new Date(initialDate), "yyyy-MM-dd'T'HH:mm") : '';
			endDateValue = initialEndDate ? format(new Date(initialEndDate), "yyyy-MM-dd'T'HH:mm") : '';
			description = '';
			status = 'proposed';
			isSubmitting = false;
			error = '';
		}
	});

	const isValid = $derived(
		selectedPatientId &&
			selectedPractitionerId &&
			dateValue &&
			endDateValue &&
			new Date(endDateValue) > new Date(dateValue)
	);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!isValid) return;

		isSubmitting = true;
		error = '';

		try {
			const appointment = await createAppointment({
				status,
				start: new Date(dateValue).toISOString(),
				end: new Date(endDateValue).toISOString(),
				description,
				participant: [
					{
						actor: { reference: `Patient/${selectedPatientId}` },
						status: 'accepted'
					},
					{
						actor: { reference: `Practitioner/${selectedPractitionerId}` },
						status: 'accepted'
					}
				],
				serviceType: selectedServiceId
					? [
							{
								text: services.find((s) => s.id === selectedServiceId)?.name || selectedServiceId
							}
						]
					: undefined,
				created: new Date().toISOString()
			});
			onCreated?.(appointment);
			onClose?.();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create appointment';
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		onClose?.();
	}
</script>

<Modal {open} title="New Appointment" onClose={handleCancel}>
	<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
		{#if error}
			<div class="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
				{error}
			</div>
		{/if}

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="patient">Patient</label>
			<select
				id="patient"
				class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				bind:value={selectedPatientId}
				required
			>
				<option value="">Select patient</option>
				{#each patients as patient (patient.id)}
					{@const name = patient.name?.[0]
						? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim()
						: patient.id}
					<option value={patient.id}>{name}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="practitioner">Practitioner</label>
			<select
				id="practitioner"
				class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				bind:value={selectedPractitionerId}
				required
			>
				<option value="">Select practitioner</option>
				{#each practitioners as practitioner (practitioner.id)}
					{@const name = practitioner.name?.[0]
						? `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim()
						: practitioner.id}
					<option value={practitioner.id}>{name}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="service">Service</label>
			<select
				id="service"
				class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				bind:value={selectedServiceId}
			>
				<option value="">Select service (optional)</option>
				{#each services as service (service.id)}
					<option value={service.id}>{service.name || service.id}</option>
				{/each}
			</select>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="start">Start</label>
				<input
					id="start"
					type="datetime-local"
					class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					bind:value={dateValue}
					required
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="end">End</label>
				<input
					id="end"
					type="datetime-local"
					class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					bind:value={endDateValue}
					required
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="status">Status</label>
			<select
				id="status"
				class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				bind:value={status}
				required
			>
				<option value="proposed">Proposed</option>
				<option value="pending">Pending</option>
				<option value="booked">Booked</option>
				<option value="arrived">Arrived</option>
				<option value="fulfilled">Fulfilled</option>
				<option value="cancelled">Cancelled</option>
				<option value="noshow">No Show</option>
			</select>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="description">Description</label>
			<textarea
				id="description"
				class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				rows={3}
				bind:value={description}
				placeholder="Appointment details..."
			></textarea>
		</div>

		<div class="flex justify-end gap-3 pt-2">
			<button
				type="button"
				class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				onclick={handleCancel}
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={!isValid || isSubmitting}
			>
				{isSubmitting ? 'Creating...' : 'Create Appointment'}
			</button>
		</div>
	</form>
</Modal>
