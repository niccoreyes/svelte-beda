<script lang="ts">
	import type { Bundle, Encounter } from 'fhir/r4b';
	import { getFHIRResources, updateFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { formatPeriodDateTime } from '$lib/utils';
	import { Role } from '$lib/auth/role';
	import { matchCurrentUserRole } from '$lib/auth/permissions';
	import { getCurrentUser } from '$lib/auth/user';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	let statusFilter = $state<string>('');
	let dateFrom = $state<string>('');
	let dateTo = $state<string>('');

	const currentUser = getCurrentUser();
	const userRole = currentUser?.role as Role | undefined;
	const isPractitioner = matchCurrentUserRole(userRole, Role.Practitioner, Role.Admin);

	const encountersState = createServiceState<Bundle>(async () => {
		const params: Record<string, string> = { patient: `Patient/${patientId}`, _sort: '-date' };
		if (statusFilter) params.status = statusFilter;
		if (dateFrom) params['date:ge'] = dateFrom;
		if (dateTo) params['date:le'] = dateTo;
		return getFHIRResources('Encounter', params);
	});

	$effect(() => {
		if (patientId) encountersState.reload();
	});

	function handleStatusChange(encounter: Encounter, newStatus: string) {
		if (!encounter.id) return;
		const updated = { ...encounter, status: newStatus as Encounter['status'] };
		updateFHIRResource(updated).then(() => {
			encountersState.reload();
		});
	}

	const encounters = $derived(() => {
		if (encountersState.data.status !== 'success') return [];
		const bundle = encountersState.data.data;
		return (bundle.entry?.map((e) => e.resource as Encounter).filter(Boolean) || []) as Encounter[];
	});

	const statusOptions = [
		'planned',
		'in-progress',
		'finished',
		'cancelled',
		'onhold',
		'entered-in-error',
		'unknown'
	];
</script>

<div class="space-y-4">
	<div class="flex flex-wrap gap-3">
		<select
			bind:value={statusFilter}
			onchange={() => encountersState.reload()}
			class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
		>
			<option value="">All Statuses</option>
			{#each statusOptions as s}
				<option value={s}>{s}</option>
			{/each}
		</select>
		<input
			type="date"
			bind:value={dateFrom}
			onchange={() => encountersState.reload()}
			class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			placeholder="From"
		/>
		<input
			type="date"
			bind:value={dateTo}
			onchange={() => encountersState.reload()}
			class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
			placeholder="To"
		/>
	</div>

	<RenderRemoteData remoteData={encountersState.data}>
		{#snippet children(data)}
			{@const list = encounters()}
			{#if list.length === 0}
				<Empty message="No encounters found" />
			{:else}
				<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
					<table class="w-full text-sm">
						<thead class="bg-gray-50 dark:bg-gray-700/50">
							<tr>
								<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
									>Date</th
								>
								<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
									>Practitioner</th
								>
								<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
									>Status</th
								>
								<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
									>Type</th
								>
								<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
							{#each list as encounter}
								{@const participant = encounter.participant?.[0]?.individual}
								{@const typeText =
									encounter.type?.[0]?.text || encounter.type?.[0]?.coding?.[0]?.display || '-'}
								<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
									<td class="px-4 py-3">
										<a
											href={`/patients/${patientId}/encounters/${encounter.id}/`}
											class="text-primary hover:underline"
										>
											{encounter.period?.start
												? formatPeriodDateTime(encounter.period)
												: '-'}
										</a>
									</td>
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">
										{participant?.display || participant?.reference || '-'}
									</td>
									<td class="px-4 py-3">
										{#if isPractitioner}
											<select
												value={encounter.status}
												onchange={(e) =>
													handleStatusChange(
															encounter,
															(e.target as HTMLSelectElement).value
														)}
												class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
											>
												{#each statusOptions as s}
													<option value={s}>{s}</option>
												{/each}
											</select>
										{:else}
											<span
												class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700"
												>{encounter.status}</span
											>
										{/if}
									</td>
									<td class="px-4 py-3 text-gray-700 dark:text-gray-300">{typeText}</td>
									<td class="px-4 py-3">
										<a
											href={`/patients/${patientId}/encounters/${encounter.id}/`}
											class="text-xs text-primary hover:underline">Open →</a
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/snippet}
		{#snippet renderLoading()}
			<Spinner />
		{/snippet}
	</RenderRemoteData>
</div>
