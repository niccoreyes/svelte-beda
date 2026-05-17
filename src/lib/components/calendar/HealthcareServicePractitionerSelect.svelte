<script lang="ts">
	import type { HealthcareService, Practitioner, PractitionerRole } from 'fhir/r4b';

	interface Props {
		services?: HealthcareService[];
		practitioners?: Practitioner[];
		practitionerRoles?: PractitionerRole[];
		selectedServiceId?: string;
		selectedPractitionerId?: string;
		onSelect?: (serviceId: string | undefined, practitionerId: string | undefined) => void;
		label?: string;
		placeholder?: string;
	}

	let {
		services = [],
		practitioners = [],
		practitionerRoles = [],
		selectedServiceId = $bindable(),
		selectedPractitionerId = $bindable(),
		onSelect,
		label = 'Service & Practitioner',
		placeholder = 'Select service and practitioner'
	}: Props = $props();

	const comboOptions = $derived(() => {
		const options: Array<{
			serviceId: string;
			practitionerId: string;
			label: string;
		}> = [];

		for (const role of practitionerRoles) {
			const practitionerRef = role.practitioner?.reference;
			const serviceRefs = role.healthcareService?.map((hs) => hs.reference) || [];

			if (!practitionerRef) continue;

			const practitionerId = practitionerRef.replace('Practitioner/', '');
			const practitioner = practitioners.find((p) => p.id === practitionerId);
			const practitionerName = practitioner?.name?.[0]
				? `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim()
				: practitionerRef;

			for (const serviceRef of serviceRefs) {
				if (!serviceRef) continue;
				const serviceId = serviceRef.replace('HealthcareService/', '');
				const service = services.find((s) => s.id === serviceId);
				const serviceName = service?.name || serviceRef;

				options.push({
					serviceId,
					practitionerId,
					label: `${serviceName} — ${practitionerName}`
				});
			}
		}

		for (const service of services) {
			const alreadyPaired = options.some((o) => o.serviceId === service.id);
			if (!alreadyPaired) {
				options.push({
					serviceId: service.id || '',
					practitionerId: '',
					label: `${service.name || service.id} — Any practitioner`
				});
			}
		}

		for (const practitioner of practitioners) {
			const alreadyPaired = options.some((o) => o.practitionerId === practitioner.id);
			if (!alreadyPaired) {
				const practitionerName = practitioner.name?.[0]
					? `${practitioner.name[0].given?.join(' ') || ''} ${practitioner.name[0].family || ''}`.trim()
					: practitioner.id;
				options.push({
					serviceId: '',
					practitionerId: practitioner.id || '',
					label: `Any service — ${practitionerName}`
				});
			}
		}

		return options;
	});

	const selectedValue = $derived(() => {
		if (!selectedServiceId && !selectedPractitionerId) return '';
		return `${selectedServiceId}||${selectedPractitionerId}`;
	});

	function handleChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		if (!value) {
			selectedServiceId = undefined;
			selectedPractitionerId = undefined;
			onSelect?.(undefined, undefined);
			return;
		}
		const [serviceId, practitionerId] = value.split('||');
		selectedServiceId = serviceId || undefined;
		selectedPractitionerId = practitionerId || undefined;
		onSelect?.(selectedServiceId, selectedPractitionerId);
	}
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="hs-practitioner-select">{label}</label>
	{/if}
	<select
		id="hs-practitioner-select"
		class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
		value={selectedValue()}
		onchange={handleChange}
	>
		<option value="">{placeholder}</option>
		{#each comboOptions() as option}
			<option value="{option.serviceId}||{option.practitionerId}">{option.label}</option>
		{/each}
	</select>
</div>
