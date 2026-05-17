<script lang="ts">
	import { generatePatientSummary } from '$lib/ai/summary';
	import type { PatientSummaryResult } from '$lib/ai/summary';

	interface Props {
		patientId: string;
	}

	let { patientId }: Props = $props();

	let summaryState = $state<{
		status: 'idle' | 'loading' | 'success' | 'error';
		data?: PatientSummaryResult;
		error?: string;
	}>({ status: 'idle' });

	async function handleGenerate() {
		summaryState = { status: 'loading' };
		try {
			const result = await generatePatientSummary(patientId);
			summaryState = { status: 'success', data: result };
		} catch (e) {
			summaryState = { status: 'error', error: e instanceof Error ? e.message : 'Failed to generate summary' };
		}
	}
</script>

<div class="rounded-lg border border-[var(--gray-4)] bg-[var(--theme-sidebar-background)] p-4 shadow-sm">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-sm font-semibold text-[var(--gray-10)] uppercase tracking-wider">AI Summary</h3>
		<button
			onclick={handleGenerate}
			disabled={summaryState.status === 'loading'}
			class="inline-flex items-center gap-1.5 rounded-md bg-[var(--theme-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{#if summaryState.status === 'loading'}
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
				</svg>
				Generating...
			{:else}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Generate
			{/if}
		</button>
	</div>

	{#if summaryState.status === 'error'}
		<div class="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
			{summaryState.error}
		</div>
	{:else if summaryState.status === 'success' && summaryState.data}
		<div class="space-y-3">
			<p class="text-sm text-[var(--gray-9)] leading-relaxed">{summaryState.data.summary}</p>
			{#if summaryState.data.highlights.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each summaryState.data.highlights as highlight}
						<span class="inline-flex items-center rounded-full bg-[var(--theme-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--theme-primary)]">
							{highlight}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-sm text-[var(--gray-7)] italic">Click Generate to create an AI-powered patient summary.</p>
	{/if}
</div>
