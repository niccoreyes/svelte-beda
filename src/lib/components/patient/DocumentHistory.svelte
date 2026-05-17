<script lang="ts">
	import type { FhirResource, Provenance, Bundle } from 'fhir/r4b';
	import { loadResourceHistory } from '$lib/fhir';
	import { queryProvenanceByTarget } from '$lib/fhir/provenance';
	import { createServiceState } from '$lib/state';
	import RenderRemoteData from '$lib/components/RenderRemoteData.svelte';
	import Empty from '$lib/components/Empty.svelte';
	import ChangesDiff from './ChangesDiff.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { humanDateTime } from '$lib/utils';

	interface Props {
		resourceType: string;
		resourceId: string;
		open?: boolean;
		onClose?: () => void;
	}

	let { resourceType, resourceId, open = false }: Props = $props();

	let selectedOldVersion = $state<FhirResource | null>(null);
	let selectedNewVersion = $state<FhirResource | null>(null);
	let diffOpen = $state(false);
	let viewMode = $state<'inline' | 'sideBySide'>('inline');

	const reference = $derived(`${resourceType}/${resourceId}`);

	const historyState = createServiceState<{ entry?: Array<{ resource?: FhirResource }> }>(async () => {
		return loadResourceHistory({ reference });
	});

	const provenanceState = createServiceState<Bundle>(async () => {
		return queryProvenanceByTarget({ resourceType, id: resourceId });
	});

	$effect(() => {
		if (open) {
			historyState.reload();
			provenanceState.reload();
		}
	});

	function getProvenances(): Provenance[] {
		if (provenanceState.data.status !== 'success') return [];
		const bundle = provenanceState.data.data;
		return (
			bundle.entry
				?.map((e) => e.resource as Provenance)
				.filter((r): r is Provenance => r?.resourceType === 'Provenance') || []
		);
	}

	function getVersionAuthor(versionId: string | undefined, provenances: Provenance[]): string {
		if (!versionId) return 'System';
		const prov = provenances.find((p) =>
			p.target?.some((t) => t.reference === reference || t.reference?.endsWith(`/${resourceId}`))
		);
		if (!prov) return 'System';
		const agent = prov.agent?.[0]?.who;
		if (!agent) return 'System';
		const who = agent as string | { display?: string; reference?: string };
		if (typeof who === 'string') return who.split('/').pop() || 'Unknown';
		return who.display || who.reference?.split('/').pop() || 'Unknown';
	}

	function openDiff(oldVersion: FhirResource, newVersion: FhirResource) {
		selectedOldVersion = oldVersion;
		selectedNewVersion = newVersion;
		diffOpen = true;
	}

	function closeDiff() {
		diffOpen = false;
		selectedOldVersion = null;
		selectedNewVersion = null;
	}

	function getVersionText(resource: FhirResource | null): string {
		if (!resource) return '';
		try {
			return JSON.stringify(resource, null, 2);
		} catch {
			return String(resource);
		}
	}

	function getVersionNumber(index: number, total: number): number {
		return total - index;
	}
</script>

{#if open}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Document History</h3>
			{#if diffOpen}
				<button
					onclick={() => (diffOpen = false)}
					class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
				>
					Back to versions
				</button>
			{/if}
		</div>

		{#if diffOpen && selectedOldVersion && selectedNewVersion}
			<div class="space-y-3">
				<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
					<div>
						<span class="font-medium">Old:</span>
						{humanDateTime(selectedOldVersion.meta?.lastUpdated || '')} · Version {selectedOldVersion.meta?.versionId || '-'}
					</div>
					<div>
						<span class="font-medium">New:</span>
						{humanDateTime(selectedNewVersion.meta?.lastUpdated || '')} · Version {selectedNewVersion.meta?.versionId || '-'}
					</div>
					<div class="flex gap-2">
						<button
							onclick={() => (viewMode = 'inline')}
							class="px-2 py-1 text-xs rounded {viewMode === 'inline' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}"
						>
							Inline
						</button>
						<button
							onclick={() => (viewMode = 'sideBySide')}
							class="px-2 py-1 text-xs rounded {viewMode === 'sideBySide' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}"
						>
							Side by Side
						</button>
					</div>
				</div>
				<ChangesDiff
					oldText={getVersionText(selectedOldVersion)}
					newText={getVersionText(selectedNewVersion)}
					mode={viewMode}
				/>
			</div>
		{:else}
			<RenderRemoteData remoteData={historyState.data}>
				{#snippet children(historyData)}
					{@const typedHistory = historyData as { entry?: Array<{ resource?: FhirResource }> }}
					{@const versions = (typedHistory.entry?.map((e) => e.resource).filter(Boolean) || []) as FhirResource[]}
					{@const provenances = getProvenances()}
					{#if versions.length > 0}
						<div class="space-y-2 max-h-[60vh] overflow-y-auto">
							{#each versions as version, i}
								<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div class="min-w-0">
										<p class="font-medium text-sm">
											Version {getVersionNumber(i, versions.length)}
											<span class="text-gray-500 dark:text-gray-400 font-normal">
												({version.meta?.versionId || '-'})
											</span>
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400">
											{humanDateTime(version.meta?.lastUpdated || '')}
											· {getVersionAuthor(version.meta?.versionId, provenances)}
										</p>
									</div>
									<div class="flex gap-2 shrink-0">
										{#if i < versions.length - 1}
											<button
												onclick={() => openDiff(versions[i + 1]!, version)}
												class="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											>
												Compare with previous
											</button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<Empty message="No history found" />
					{/if}
				{/snippet}
			</RenderRemoteData>
		{/if}
	</div>
{/if}

<Modal open={diffOpen && !!selectedOldVersion && !!selectedNewVersion} title="Version Diff" onClose={closeDiff}>
	{#if selectedOldVersion && selectedNewVersion}
		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
				<div>
					<span class="font-medium">Old:</span>
					{humanDateTime(selectedOldVersion.meta?.lastUpdated || '')} · Version {selectedOldVersion.meta?.versionId || '-'}
				</div>
				<div>
					<span class="font-medium">New:</span>
					{humanDateTime(selectedNewVersion.meta?.lastUpdated || '')} · Version {selectedNewVersion.meta?.versionId || '-'}
				</div>
				<div class="flex gap-2">
					<button
						onclick={() => (viewMode = 'inline')}
						class="px-2 py-1 text-xs rounded {viewMode === 'inline' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}"
					>
						Inline
					</button>
					<button
						onclick={() => (viewMode = 'sideBySide')}
						class="px-2 py-1 text-xs rounded {viewMode === 'sideBySide' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}"
					>
						Side by Side
					</button>
				</div>
			</div>
			<ChangesDiff
				oldText={getVersionText(selectedOldVersion)}
				newText={getVersionText(selectedNewVersion)}
				mode={viewMode}
			/>
		</div>
	{/if}
</Modal>
