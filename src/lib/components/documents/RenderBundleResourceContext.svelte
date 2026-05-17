<script lang="ts">
	import type { BundleEntry, DocumentReference, Composition, Binary } from 'fhir/r4b';
	import { humanDate } from '$lib/utils';

	interface Props {
		entry: BundleEntry;
	}

	let { entry }: Props = $props();

	const resource = $derived(entry.resource);
	const resourceType = $derived((resource as { resourceType?: string } | undefined)?.resourceType);

	const docRef = $derived(resourceType === 'DocumentReference' ? (resource as DocumentReference) : null);
	const composition = $derived(resourceType === 'Composition' ? (resource as Composition) : null);
	const binary = $derived(resourceType === 'Binary' ? (resource as Binary) : null);
</script>

{#if resource}
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold uppercase text-gray-500">{resourceType}</span>
			{#if resource.meta?.lastUpdated}
				<span class="text-xs text-gray-400">{humanDate(resource.meta.lastUpdated)}</span>
			{/if}
		</div>

		{#if docRef}
			<div class="space-y-1">
				<p class="text-sm text-gray-900 dark:text-white">
					{docRef.description || docRef.content?.[0]?.attachment?.title || 'Untitled Document'}
				</p>
				{#if docRef.type?.text || docRef.type?.coding?.[0]?.display}
					<p class="text-xs text-gray-500">Type: {docRef.type.text || docRef.type.coding?.[0]?.display}</p>
				{/if}
				{#if docRef.docStatus}
					<p class="text-xs text-gray-500">Status: {docRef.docStatus}</p>
				{/if}
			</div>
		{:else if composition}
			<div class="space-y-1">
				<p class="text-sm text-gray-900 dark:text-white">
					{composition.title || 'Untitled Composition'}
				</p>
				{#if composition.status}
					<p class="text-xs text-gray-500">Status: {composition.status}</p>
				{/if}
				{#if composition.date}
					<p class="text-xs text-gray-500">Date: {humanDate(composition.date)}</p>
				{/if}
			</div>
		{:else if binary}
			<p class="text-sm text-gray-500">Binary content ({binary.contentType || 'unknown type'})</p>
		{:else}
			<p class="text-sm text-gray-700 dark:text-gray-300">
				{JSON.stringify(resource).slice(0, 200)}...
			</p>
		{/if}
	</div>
{:else}
	<p class="text-sm text-gray-400">No resource data</p>
{/if}
