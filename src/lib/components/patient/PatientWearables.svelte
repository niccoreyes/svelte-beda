<script lang="ts">
	import type { Bundle, Observation } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDateTime } from '$lib/utils';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const wearableState = createServiceState<Bundle>(async () => {
		return getFHIRResources('Observation', {
			patient: `Patient/${patientId}`,
			category: 'vital-signs',
			_sort: '-date',
			_count: '50'
		});
	});

	$effect(() => {
		if (patientId) {
			wearableState.reload();
		}
	});

	function formatValue(obs: Observation): string {
		if (obs.valueQuantity) {
			const q = obs.valueQuantity;
			return `${q.value} ${q.unit || ''}`;
		}
		if (obs.valueString) return obs.valueString;
		if (obs.component && obs.component.length > 0) {
			return obs.component
				.map((c) => {
					const val = c.valueQuantity ? `${c.valueQuantity.value} ${c.valueQuantity.unit || ''}` : c.valueString || '';
					const code = c.code?.text || c.code?.coding?.[0]?.display || '';
					return code ? `${code}: ${val}` : val;
				})
				.filter(Boolean)
				.join(', ');
		}
		return '-';
	}
</script>

	<RenderRemoteData remoteData={wearableState.data}>
		{#snippet children(data)}
			{@const bundle = data as Bundle}
			{@const observations = (bundle.entry?.map((e) => e.resource as Observation).filter(Boolean) || []) as Observation[]}
			{#if observations.length > 0}
				<div class="space-y-2">
					{#each observations as obs (obs.id)}
						<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div>
								<p class="font-medium">{obs.code?.text || obs.code?.coding?.[0]?.display || 'Observation'}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{obs.status}
								</p>
							</div>
							<div class="text-right shrink-0">
								<p class="text-lg font-semibold">{formatValue(obs)}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">{obs.effectiveDateTime ? humanDateTime(obs.effectiveDateTime) : '-'}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<Empty message="No wearable data found" />
			{/if}
		{/snippet}
	</RenderRemoteData>
