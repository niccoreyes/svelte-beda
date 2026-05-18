<script lang="ts">
	import SmartAppLauncher from './SmartAppLauncher.svelte';
	import SmartAppModal from './SmartAppModal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { generateSmartLaunchContext } from '$lib/smart/launch';
	import { DEFAULT_SMART_APPS, isSmartAppAllowed } from '$lib/smart/config';

	interface Props {
		patientId: string;
		encounterId?: string;
		userId?: string;
	}

	let { patientId, encounterId, userId }: Props = $props();

	let launchModalOpen = $state(false);
	let selectedAppUrl = $state('');
	let documentModalOpen = $state(false);
	let documentUrl = $state('');
	let documentTitle = $state('');

	const launchContext = $derived(generateSmartLaunchContext(patientId, encounterId, userId));

	function handleLaunch(app: { name: string; url: string }) {
		if (!isSmartAppAllowed(app.url)) {
			alert(`App URL ${app.url} is not in the whitelist. Please configure it in settings.`);
			return;
		}
		selectedAppUrl = app.url;
		launchModalOpen = true;
	}

	function closeLaunchModal() {
		launchModalOpen = false;
		selectedAppUrl = '';
	}

	function showDocument(url: string, title?: string) {
		documentUrl = url;
		documentTitle = title || 'External Document';
		documentModalOpen = true;
	}

	function closeDocumentModal() {
		documentModalOpen = false;
		documentUrl = '';
		documentTitle = '';
	}

	// Listen for postMessage from SMART apps requesting document display
	$effect(() => {
		function handleMessage(event: MessageEvent) {
			// Only accept messages from the launched app or same origin
			if (selectedAppUrl && event.origin !== new URL(selectedAppUrl).origin && event.origin !== window.location.origin) {
				return;
			}
			if (event.data && typeof event.data === 'object') {
				if (event.data.type === 'beda:show-document' && event.data.url) {
					showDocument(event.data.url, event.data.title);
				}
			}
		}
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	});
</script>

<div class="space-y-4">
	<SmartAppLauncher
		apps={DEFAULT_SMART_APPS.map((app) => ({
			name: app.name,
			url: app.url,
			description: app.description,
			icon: app.icon
		}))}
		{patientId}
		onLaunch={handleLaunch}
	/>

	<div class="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
		<p class="text-sm text-gray-500 dark:text-gray-400">
			Additional SMART apps can be configured in settings.
			<span class="text-xs block mt-1">Whitelist: {DEFAULT_SMART_APPS.map(a => a.url).join(', ')}</span>
		</p>
	</div>
</div>

{#if launchModalOpen}
	<SmartAppModal
		appUrl={selectedAppUrl}
		{launchContext}
		onClose={closeLaunchModal}
	/>
{/if}

{#if documentModalOpen}
	<Modal open={true} title={documentTitle} onClose={closeDocumentModal}>
		<div class="space-y-3">
			<div class="w-full" style="height: 600px;">
				{#if documentUrl.endsWith('.pdf')}
					<iframe
						src={documentUrl}
						title={documentTitle}
						class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
						sandbox="allow-scripts allow-same-origin"
					></iframe>
				{:else}
					<div class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-4">
						<div class="text-center">
							<svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">External document:</p>
							<a
								href={documentUrl}
								target="_blank"
								rel="external noopener noreferrer"
								class="text-primary hover:underline break-all"
							>
								{documentUrl}
							</a>
						</div>
					</div>
				{/if}
			</div>
			<div class="flex justify-end">
				<button
					onclick={closeDocumentModal}
					class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</Modal>
{/if}
