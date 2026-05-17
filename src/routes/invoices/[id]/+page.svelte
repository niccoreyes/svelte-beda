<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Spinner } from '$lib/components';
	import { getFHIRResource } from '$lib/fhir';
	import { createServiceState } from '$lib/state';
	import type { Invoice } from 'fhir/r4b';

	const id = $page.params.id;

	const invoiceState = createServiceState<Invoice>(async () => {
		return getFHIRResource<Invoice>({ reference: `Invoice/${id}` });
	});

	$effect(() => {
		invoiceState.reload();
	});
</script>

<PageContainer title="Invoice Details" variant="default">
	{#if invoiceState.data.status === 'loading'}
		<div class="flex items-center justify-center h-64">
			<Spinner />
		</div>
	{:else if invoiceState.data.status === 'failure'}
		<div class="p-4 text-error">
			<p>Error loading invoice: {invoiceState.data.error?.message || 'Unknown error'}</p>
		</div>
	{:else if invoiceState.data.status === 'success'}
		{@const invoice = invoiceState.data.data}
		<div class="space-y-4">
			<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
				<p class="text-lg font-medium">{invoice.status || '-'}</p>
			</div>
			{#if invoice.totalNet}
				<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<p class="text-sm text-gray-500 dark:text-gray-400">Total Net</p>
					<p class="text-lg font-medium">{invoice.totalNet.value} {invoice.totalNet.currency}</p>
				</div>
			{/if}
			{#if invoice.totalGross}
				<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<p class="text-sm text-gray-500 dark:text-gray-400">Total Gross</p>
					<p class="text-lg font-medium">{invoice.totalGross.value} {invoice.totalGross.currency}</p>
				</div>
			{/if}
		</div>
	{/if}
</PageContainer>
