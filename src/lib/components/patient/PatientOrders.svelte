<script lang="ts">
	import type { Bundle, ServiceRequest } from 'fhir/r4b';
	import { getFHIRResources } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import { humanDate } from '$lib/utils';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	const ordersState = createServiceState<Bundle>(async () => {
		return getFHIRResources('ServiceRequest', {
			subject: `Patient/${patientId}`,
			_sort: '-authored'
		});
	});

	$effect(() => {
		if (patientId) {
			ordersState.reload();
		}
	});
</script>

	<RenderRemoteData remoteData={ordersState.data}>
		{#snippet children(data)}
			{@const bundle = data as Bundle}
			{@const orders = (bundle.entry?.map((e) => e.resource as ServiceRequest).filter(Boolean) || []) as ServiceRequest[]}
			{#if orders.length > 0}
				<div class="space-y-2">
					{#each orders as order (order.id)}
						<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div>
								<p class="font-medium">{order.code?.text || order.code?.coding?.[0]?.display || 'Service Request'}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{order.status} · {order.intent}
								</p>
							</div>
							<div class="text-right shrink-0">
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{order.authoredOn ? humanDate(order.authoredOn) : '-'}
								</p>
								{#if order.priority}
									<span class="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-600">
										{order.priority}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<Empty message="No orders found" />
			{/if}
		{/snippet}
	</RenderRemoteData>
