<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Practitioner } from 'fhir/r4b';

	const id = $page.params.id;

	const practitionerState = createServiceState<Practitioner>(async () => {
		return getFHIRResource<Practitioner>({ reference: `Practitioner/${id}` });
	});

	let activeTab = $state('overview');

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'scheduling', label: 'Scheduling' },
		{ id: 'availability', label: 'Availability' }
	];

	$effect(() => {
		practitionerState.reload();
	});

	function getPractitionerName(p: Practitioner): string {
		const name = p.name?.[0];
		if (!name) return 'Unknown';
		const given = name.given?.join(' ') || '';
		const family = name.family || '';
		return `${given} ${family}`.trim() || 'Unknown';
	}
</script>

{#if practitionerState.data.status === 'loading'}
	<div class="flex items-center justify-center h-64">
		<Spinner />
	</div>
{:else if practitionerState.data.status === 'failure'}
	<div class="p-4 text-error">
		<p>Error loading practitioner: {practitionerState.data.error?.message || 'Unknown error'}</p>
	</div>
{:else if practitionerState.data.status === 'success'}
	{@const practitioner = practitionerState.data.data}
	<PageContainer title={getPractitionerName(practitioner)} variant="with-tabs">
		{#snippet headerContent()}
			<div class="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
				{#each tabs as tab}
					<button
						class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
						onclick={() => activeTab = tab.id}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		{/snippet}

		{#if activeTab === 'overview'}
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Name</p>
						<p class="text-lg font-medium">{getPractitionerName(practitioner)}</p>
					</div>
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Gender</p>
						<p class="text-lg font-medium">{practitioner.gender || '-'}</p>
					</div>
				</div>
				{#if practitioner.telecom && practitioner.telecom.length > 0}
					<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="text-sm text-gray-500 dark:text-gray-400">Contact</p>
						{#each practitioner.telecom as telecom}
							<p>{telecom.system}: {telecom.value}</p>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<Empty message="{activeTab} coming soon" />
		{/if}
	</PageContainer>
{/if}
