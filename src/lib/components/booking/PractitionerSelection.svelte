<script lang="ts">
	import type { Practitioner, PractitionerRole, HealthcareService } from 'fhir/r4b';
	import { getAllFHIRResources } from '$lib/fhir/client';
	import { createServiceState } from '$lib/state';
	import Spinner from '$lib/components/Spinner.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		service: HealthcareService;
		selected?: Practitioner | null;
		onSelect: (practitioner: Practitioner) => void;
	}

	let { service, selected, onSelect }: Props = $props();

	const rolesState = createServiceState<PractitionerRole[]>(async () => {
		return getAllFHIRResources<PractitionerRole>('PractitionerRole', {
			organization: service.providedBy?.reference || service.id ? `HealthcareService/${service.id}` : undefined,
			_count: 100
		});
	});

	const practitionersState = createServiceState<Practitioner[]>(async () => {
		if (rolesState.data.status !== 'success') return [];
		const roles = rolesState.data.data;
		const practitionerRefs = roles
			.map((r) => r.practitioner?.reference)
			.filter((ref): ref is string => !!ref);
		if (practitionerRefs.length === 0) {
			// Fallback: search all practitioners if no roles found
			return getAllFHIRResources<Practitioner>('Practitioner', { _count: 100 });
		}
		const allPractitioners: Practitioner[] = [];
		for (const ref of practitionerRefs) {
			const [resourceType, id] = ref.split('/');
			if (!resourceType || !id) continue;
			try {
				const bundle = await getAllFHIRResources<Practitioner>(resourceType, { _id: id });
				allPractitioners.push(...bundle);
			} catch {
				// ignore individual fetch errors
			}
		}
		return allPractitioners;
	});

	$effect(() => {
		rolesState.reload();
	});

	$effect(() => {
		if (rolesState.data.status === 'success') {
			practitionersState.reload();
		}
	});

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}
</script>

<div class="space-y-4">
	{#if rolesState.data.status === 'loading' || practitionersState.data.status === 'loading'}
		<div class="flex items-center justify-center h-32">
			<Spinner />
		</div>
	{:else if practitionersState.data.status === 'failure'}
		<div class="p-4 text-error text-sm">
			Error loading practitioners: {practitionersState.data.error?.message || 'Unknown error'}
		</div>
	{:else if practitionersState.data.status === 'success'}
		{@const practitioners = practitionersState.data.data}
		{#if practitioners.length === 0}
			<Empty message="No practitioners found for this service" />
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each practitioners as practitioner}
					<button
						onclick={() => onSelect(practitioner)}
						class="text-left p-4 rounded-lg border transition-colors {selected?.id === practitioner.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'}"
					>
						<p class="font-medium text-gray-900 dark:text-white">{getPractitionerName(practitioner)}</p>
						{#if practitioner.qualification?.[0]?.code?.text}
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{practitioner.qualification[0].code.text}</p>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{/if}
</div>
