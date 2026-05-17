<script lang="ts">
	import type { HealthcareService } from 'fhir/r4b';
	import { getAllFHIRResources } from '$lib/fhir/client';
	import { createServiceState } from '$lib/state';
	import Spinner from '$lib/components/Spinner.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		selected?: HealthcareService | null;
		onSelect: (service: HealthcareService) => void;
	}

	let { selected, onSelect }: Props = $props();

	let searchQuery = $state('');

	const servicesState = createServiceState<HealthcareService[]>(async () => {
		return getAllFHIRResources<HealthcareService>('HealthcareService', {
			_count: 100,
			...(searchQuery ? { 'name:contains': searchQuery } : {})
		});
	});

	$effect(() => {
		servicesState.reload();
	});
</script>

<div class="space-y-4">
	<div class="relative">
		<input
			type="text"
			value={searchQuery}
			oninput={(e) => (searchQuery = e.currentTarget.value)}
			placeholder="Search services..."
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
		/>
	</div>

	{#if servicesState.data.status === 'loading'}
		<div class="flex items-center justify-center h-32">
			<Spinner />
		</div>
	{:else if servicesState.data.status === 'failure'}
		<div class="p-4 text-error text-sm">
			Error loading services: {servicesState.data.error?.message || 'Unknown error'}
		</div>
	{:else if servicesState.data.status === 'success'}
		{@const services = servicesState.data.data}
		{#if services.length === 0}
			<Empty message="No services found" />
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each services as service}
					<button
						onclick={() => onSelect(service)}
						class="text-left p-4 rounded-lg border transition-colors {selected?.id === service.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'}"
					>
						<p class="font-medium text-gray-900 dark:text-white">{service.name || 'Unnamed Service'}</p>
						{#if service.type?.[0]?.text}
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{service.type[0].text}</p>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{/if}
</div>
