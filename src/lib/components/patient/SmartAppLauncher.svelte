<script lang="ts">
	interface SmartApp {
		name: string;
		url: string;
		icon?: string;
		description?: string;
	}

	interface Props {
		apps?: SmartApp[];
		patientId: string;
		onLaunch?: (app: SmartApp) => void;
	}

	let { apps = [], patientId, onLaunch }: Props = $props();

	function handleLaunch(app: SmartApp) {
		// patientId is available for potential future use (e.g., analytics)
		void patientId;
		onLaunch?.(app);
	}
</script>

<div class="space-y-3">
	{#each apps as app (app.url)}
		<div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
			<div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
				{#if app.icon}
					<img src={app.icon} alt="{app.name} icon" class="w-6 h-6 object-contain" />
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<p class="font-medium text-gray-900 dark:text-white">{app.name}</p>
				{#if app.description}
					<p class="text-sm text-gray-500 dark:text-gray-400">{app.description}</p>
				{/if}
				<p class="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{app.url}</p>
			</div>
			<button
				onclick={() => handleLaunch(app)}
				class="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shrink-0"
			>
				Launch
			</button>
		</div>
	{/each}

	{#if apps.length === 0}
		<div class="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
			<p class="text-sm text-gray-500 dark:text-gray-400">No SMART apps configured.</p>
		</div>
	{/if}
</div>
