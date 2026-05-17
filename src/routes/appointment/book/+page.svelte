<script lang="ts">
	import type { HealthcareService, Practitioner, Patient, Appointment } from 'fhir/r4b';
	import type { TimeSlot } from '$lib/calendar/availability';
	import { createFHIRResource, findFHIRResource } from '$lib/fhir/client';
	import ServiceSelection from '$lib/components/booking/ServiceSelection.svelte';
	import PractitionerSelection from '$lib/components/booking/PractitionerSelection.svelte';
	import TimeSlotPicker from '$lib/components/booking/TimeSlotPicker.svelte';
	import PatientInfoForm from '$lib/components/booking/PatientInfoForm.svelte';
	import BookingConfirmation from '$lib/components/booking/BookingConfirmation.svelte';

	let step = $state(1);
	let selectedService = $state<HealthcareService | null>(null);
	let selectedPractitioner = $state<Practitioner | null>(null);
	let selectedSlot = $state<TimeSlot | null>(null);
	let patientInfo = $state({ givenName: '', familyName: '', phone: '', email: '' });
	let saving = $state(false);
	let error = $state<string | null>(null);
	let bookingComplete = $state(false);
	let createdAppointment = $state<Appointment | null>(null);

	const steps = [
		{ id: 1, label: 'Service' },
		{ id: 2, label: 'Practitioner' },
		{ id: 3, label: 'Time Slot' },
		{ id: 4, label: 'Patient Info' },
		{ id: 5, label: 'Confirm' }
	];

	function goToStep(target: number) {
		if (target < 1 || target > steps.length) return;
		if (target > 1 && !selectedService) return;
		if (target > 2 && !selectedPractitioner) return;
		if (target > 3 && !selectedSlot) return;
		if (target > 4 && (!patientInfo.givenName || !patientInfo.familyName)) return;
		step = target;
	}

	async function handleConfirm() {
		saving = true;
		error = null;
		try {
			// Find or create patient
			let patient: Patient | undefined;
			if (patientInfo.phone || patientInfo.email) {
				const searchParams: Record<string, string> = {};
				if (patientInfo.phone) searchParams['telecom'] = patientInfo.phone;
				if (patientInfo.email) searchParams['telecom'] = patientInfo.email;
				patient = await findFHIRResource<Patient>('Patient', searchParams);
			}

			if (!patient) {
				const newPatient: Patient = {
					resourceType: 'Patient',
					name: [
						{
							given: [patientInfo.givenName],
							family: patientInfo.familyName
						}
					],
					telecom: [
						...(patientInfo.phone ? [{ system: 'phone' as const, value: patientInfo.phone }] : []),
						...(patientInfo.email ? [{ system: 'email' as const, value: patientInfo.email }] : [])
					]
				};
				patient = await createFHIRResource(newPatient);
			}

			if (!patient?.id) {
				throw new Error('Failed to create or find patient');
			}

			const appointment: Appointment = {
				resourceType: 'Appointment',
				status: 'booked',
				start: selectedSlot!.start.toISOString(),
				end: selectedSlot!.end.toISOString(),
				serviceType: selectedService?.type,
				participant: [
					{
						actor: { reference: `Patient/${patient.id}`, display: `${patientInfo.givenName} ${patientInfo.familyName}` },
						status: 'accepted'
					},
					{
						actor: { reference: `Practitioner/${selectedPractitioner!.id}` },
						status: 'accepted'
					}
				],
				comment: `Booked via public booking page. Contact: ${patientInfo.phone || '-'} / ${patientInfo.email || '-'}`
			};

			createdAppointment = await createFHIRResource(appointment);
			bookingComplete = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Booking failed. Please try again.';
		} finally {
			saving = false;
		}
	}

	function reset() {
		step = 1;
		selectedService = null;
		selectedPractitioner = null;
		selectedSlot = null;
		patientInfo = { givenName: '', familyName: '', phone: '', email: '' };
		bookingComplete = false;
		createdAppointment = null;
		error = null;
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book an Appointment</h1>
			<p class="text-gray-600 dark:text-gray-400">Schedule your visit in a few simple steps</p>
		</div>

		{#if !bookingComplete}
			<!-- Step indicator -->
			<div class="flex items-center justify-center gap-2 mb-8">
				{#each steps as s, i}
					<div class="flex items-center gap-2">
						<button
							onclick={() => goToStep(s.id)}
							class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors {step >= s.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}"
							disabled={s.id > step}
						>
							{s.id}
						</button>
						<span class="text-sm hidden sm:inline {step >= s.id ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'}">{s.label}</span>
					</div>
					{#if i < steps.length - 1}
						<div class="w-6 h-px bg-gray-300 dark:bg-gray-600"></div>
					{/if}
				{/each}
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				{#if step === 1}
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select a Service</h2>
					<ServiceSelection
						selected={selectedService}
						onSelect={(service) => {
							selectedService = service;
							step = 2;
						}}
					/>
				{:else if step === 2}
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Select a Practitioner</h2>
						<button
							onclick={() => goToStep(1)}
							class="text-sm text-primary hover:underline"
						>
							Back
						</button>
					</div>
					{#if selectedService}
						<PractitionerSelection
							service={selectedService}
							selected={selectedPractitioner}
							onSelect={(practitioner) => {
								selectedPractitioner = practitioner;
								step = 3;
							}}
						/>
					{/if}
				{:else if step === 3}
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Choose a Time Slot</h2>
						<button
							onclick={() => goToStep(2)}
							class="text-sm text-primary hover:underline"
						>
							Back
						</button>
					</div>
					{#if selectedPractitioner}
						<TimeSlotPicker
							practitioner={selectedPractitioner}
							selectedSlot={selectedSlot}
							onSelect={(slot) => {
								selectedSlot = slot;
								step = 4;
							}}
						/>
					{/if}
				{:else if step === 4}
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h2>
						<button
							onclick={() => goToStep(3)}
							class="text-sm text-primary hover:underline"
						>
							Back
						</button>
					</div>
					<PatientInfoForm
						value={patientInfo}
						onChange={(val) => (patientInfo = val)}
					/>
					<div class="flex justify-end mt-6">
						<button
							onclick={() => {
								if (!patientInfo.givenName.trim() || !patientInfo.familyName.trim()) {
									error = 'Please enter both first and last name';
									return;
								}
								error = null;
								step = 5;
							}}
							class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
						>
							Next
						</button>
					</div>
				{:else if step === 5}
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Confirm Booking</h2>
						<button
							onclick={() => goToStep(4)}
							class="text-sm text-primary hover:underline"
						>
							Back
						</button>
					</div>
					{#if selectedService && selectedPractitioner && selectedSlot}
						<BookingConfirmation
							service={selectedService}
							practitioner={selectedPractitioner}
							slot={selectedSlot}
							{patientInfo}
							onConfirm={handleConfirm}
							{saving}
							{error}
						/>
					{/if}
				{/if}

				{#if error && step !== 5}
					<div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
						{error}
					</div>
				{/if}
			</div>
		{:else}
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
				<div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
					<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Appointment Confirmed!</h2>
				<p class="text-gray-600 dark:text-gray-400">
					Your appointment has been scheduled.
					{#if createdAppointment?.id}
						Reference: <span class="font-medium">{createdAppointment.id}</span>
					{/if}
				</p>
				<button
					onclick={reset}
					class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
				>
					Book Another Appointment
				</button>
			</div>
		{/if}
	</div>
</div>
