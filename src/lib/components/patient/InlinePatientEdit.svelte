<script lang="ts">
	import type { Patient, ContactPoint } from 'fhir/r4b';
	import { updateFHIRResource } from '$lib/fhir';

	interface Props {
		patient: Patient;
		onSave?: (patient: Patient) => void;
		onCancel?: () => void;
	}

	let { patient, onSave, onCancel }: Props = $props();

	const originalName = $derived(patient.name?.[0] || { given: [''], family: '' });
	const originalAddress = $derived(patient.address?.[0] || { line: [''], city: '', state: '', postalCode: '', country: '' });
	const originalTelecom = $derived(patient.telecom?.[0] || { system: 'phone', value: '' });

	// svelte-ignore state_referenced_locally (form fields initialize from props; component is remounted per patient)
	let givenName = $state(originalName.given?.[0] || '');
	// svelte-ignore state_referenced_locally
	let familyName = $state(originalName.family || '');
	// svelte-ignore state_referenced_locally
	let birthDate = $state(patient.birthDate || '');
	// svelte-ignore state_referenced_locally
	let gender = $state(patient.gender || '');
	// svelte-ignore state_referenced_locally
	let addressLine = $state(originalAddress.line?.[0] || '');
	// svelte-ignore state_referenced_locally
	let city = $state(originalAddress.city || '');
	// svelte-ignore state_referenced_locally
	let addressState = $state(originalAddress.state || '');
	// svelte-ignore state_referenced_locally
	let postalCode = $state(originalAddress.postalCode || '');
	// svelte-ignore state_referenced_locally
	let country = $state(originalAddress.country || '');
	// svelte-ignore state_referenced_locally
	let telecomSystem = $state(originalTelecom.system || 'phone');
	// svelte-ignore state_referenced_locally
	let telecomValue = $state(originalTelecom.value || '');
	let submitting = $state(false);
	let errors = $state<Record<string, string>>({});

	const genderOptions = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'other', label: 'Other' },
		{ value: 'unknown', label: 'Unknown' }
	];

	const telecomSystems = [
		{ value: 'phone', label: 'Phone' },
		{ value: 'email', label: 'Email' },
		{ value: 'fax', label: 'Fax' },
		{ value: 'pager', label: 'Pager' },
		{ value: 'url', label: 'URL' },
		{ value: 'sms', label: 'SMS' },
		{ value: 'other', label: 'Other' }
	];

	function validate(): boolean {
		const newErrors: Record<string, string> = {};
		if (!familyName.trim() && !givenName.trim()) {
			newErrors.name = 'At least one name field is required';
		}
		if (birthDate) {
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (!dateRegex.test(birthDate)) {
				newErrors.birthDate = 'Invalid date format (YYYY-MM-DD)';
			} else {
				const d = new Date(birthDate);
				if (isNaN(d.getTime())) {
					newErrors.birthDate = 'Invalid date';
				}
			}
		}
		if (!gender) {
			newErrors.gender = 'Gender is required';
		}
		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	function handleCancel() {
		givenName = originalName.given?.[0] || '';
		familyName = originalName.family || '';
		birthDate = patient.birthDate || '';
		gender = patient.gender || '';
		addressLine = originalAddress.line?.[0] || '';
		city = originalAddress.city || '';
		addressState = originalAddress.state || '';
		postalCode = originalAddress.postalCode || '';
		country = originalAddress.country || '';
		telecomSystem = originalTelecom.system || 'phone';
		telecomValue = originalTelecom.value || '';
		errors = {};
		onCancel?.();
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		submitting = true;
		try {
			const updatedPatient: Patient = {
				...patient,
				name: [
					{
						given: givenName.trim() ? [givenName.trim()] : [],
						family: familyName.trim()
					}
				],
				birthDate: birthDate || undefined,
				gender: gender as Patient['gender'],
				address: [
					{
						line: addressLine.trim() ? [addressLine.trim()] : [],
						city: city.trim() || undefined,
						state: addressState.trim() || undefined,
						postalCode: postalCode.trim() || undefined,
						country: country.trim() || undefined
					}
				],
				telecom: [
					{
						system: telecomSystem as ContactPoint['system'],
						value: telecomValue.trim() || undefined
					}
				]
			};

			const result = await updateFHIRResource(updatedPatient);
			onSave?.(result);
		} catch (err) {
			console.error('Failed to update patient:', err);
			errors = { ...errors, submit: 'Failed to save changes. Please try again.' };
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={handleSave} class="space-y-4">
	{#if errors.submit}
		<div class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
			{errors.submit}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="edit-given" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Given Name
			</label>
			<input
				id="edit-given"
				type="text"
				bind:value={givenName}
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
		</div>
		<div>
			<label for="edit-family" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Family Name <span class="text-red-500">*</span>
			</label>
			<input
				id="edit-family"
				type="text"
				bind:value={familyName}
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
				class:border-red-300={errors.name}
				class:dark:border-red-500={errors.name}
			/>
		</div>
	</div>
	{#if errors.name}
		<p class="text-xs text-red-600 dark:text-red-400">{errors.name}</p>
	{/if}

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="edit-birthdate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Birth Date
			</label>
			<input
				id="edit-birthdate"
				type="date"
				bind:value={birthDate}
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
				class:border-red-300={errors.birthDate}
				class:dark:border-red-500={errors.birthDate}
			/>
			{#if errors.birthDate}
				<p class="text-xs text-red-600 dark:text-red-400 mt-1">{errors.birthDate}</p>
			{/if}
		</div>
		<div>
			<label for="edit-gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Gender <span class="text-red-500">*</span>
			</label>
			<select
				id="edit-gender"
				bind:value={gender}
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
				class:border-red-300={errors.gender}
				class:dark:border-red-500={errors.gender}
			>
				<option value="">Select gender...</option>
				{#each genderOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			{#if errors.gender}
				<p class="text-xs text-red-600 dark:text-red-400 mt-1">{errors.gender}</p>
			{/if}
		</div>
	</div>

	<div>
		<label for="edit-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Address
		</label>
		<input
			id="edit-address"
			type="text"
			bind:value={addressLine}
			placeholder="Street address"
			class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm mb-2"
		/>
		<div class="grid grid-cols-2 gap-2">
			<input
				type="text"
				bind:value={city}
				placeholder="City"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
			<input
				type="text"
				bind:value={addressState}
				placeholder="State"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
		</div>
		<div class="grid grid-cols-2 gap-2 mt-2">
			<input
				type="text"
				bind:value={postalCode}
				placeholder="Postal Code"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
			<input
				type="text"
				bind:value={country}
				placeholder="Country"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label for="edit-telecom-system" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Contact Type
			</label>
			<select
				id="edit-telecom-system"
				bind:value={telecomSystem}
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			>
				{#each telecomSystems as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="edit-telecom-value" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
				Contact Value
			</label>
			<input
				id="edit-telecom-value"
				type="text"
				bind:value={telecomValue}
				placeholder="Phone or email"
				class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			/>
		</div>
	</div>

	<div class="flex justify-end gap-2 pt-2">
		<button
			type="button"
			onclick={handleCancel}
			class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
		>
			Cancel
		</button>
		<button
			type="submit"
			disabled={submitting}
			class="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
		>
			{submitting ? 'Saving...' : 'Save Changes'}
		</button>
	</div>
</form>
