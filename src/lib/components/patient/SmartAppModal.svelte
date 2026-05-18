<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { buildLaunchUrl, type SmartLaunchContext } from '$lib/smart/launch';

	interface Props {
		appUrl: string;
		launchContext: SmartLaunchContext;
		onClose?: () => void;
	}

	let { appUrl, launchContext, onClose }: Props = $props();

	let iframeLoaded = $state(false);
	let iframeError = $state(false);

	const launchUrl = $derived(buildLaunchUrl(appUrl, launchContext));

	function handleIframeLoad() {
		iframeLoaded = true;
		iframeError = false;
	}

	function handleIframeError() {
		iframeError = true;
		iframeLoaded = false;
	}
</script>

<Modal open={true} title="SMART App" onClose={onClose}>
	<div class="space-y-3">
		<div class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
			<p>Launching: <span class="font-mono">{appUrl}</span></p>
			{#if launchContext.patient}
				<p>Patient: <span class="font-mono">{launchContext.patient}</span></p>
			{/if}
			{#if launchContext.encounter}
				<p>Encounter: <span class="font-mono">{launchContext.encounter}</span></p>
			{/if}
		</div>

		<div class="relative w-full" style="height: 600px;">
			{#if !iframeLoaded && !iframeError}
				<div class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
					<div class="flex flex-col items-center gap-2">
						<svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<p class="text-sm text-gray-500 dark:text-gray-400">Loading SMART app...</p>
					</div>
				</div>
			{/if}
			{#if iframeError}
				<div class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
					<div class="text-center p-4">
						<svg class="w-12 h-12 text-error mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<p class="text-sm text-error">Failed to load SMART app.</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">The app may not support iframe embedding.</p>
					</div>
				</div>
			{/if}
			<iframe
				src={launchUrl}
				title="SMART App"
				class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
				allow="fullscreen; clipboard-read; clipboard-write"
				onload={handleIframeLoad}
				onerror={handleIframeError}
			></iframe>
		</div>

		<div class="flex items-center justify-between">
			<button
				onclick={onClose}
				class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
				Close
			</button>
			<a
				href={launchUrl}
				target="_blank"
				rel="external noopener noreferrer"
				class="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
			>
				Open in New Tab
			</a>
		</div>
	</div>
</Modal>
