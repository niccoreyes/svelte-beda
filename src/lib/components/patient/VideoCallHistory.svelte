<script lang="ts">
	interface Props {
		calls?: Array<{
			id: string;
			roomName: string;
			date: string;
			duration: string;
			participants: string[];
		}>;
	}

	let { calls = [] }: Props = $props();

	const defaultCalls = [
		{ id: 'vc-1', roomName: 'encounter-123-2024-01-15', date: '2024-01-15T10:30:00Z', duration: '12 min', participants: ['Dr. Smith', 'John Doe'] },
		{ id: 'vc-2', roomName: 'follow-up-456-2024-01-10', date: '2024-01-10T14:00:00Z', duration: '8 min', participants: ['Dr. Lee', 'Jane Doe'] },
		{ id: 'vc-3', roomName: 'consult-789-2024-01-05', date: '2024-01-05T09:15:00Z', duration: '25 min', participants: ['Dr. Brown', 'John Doe'] }
	];

	let displayCalls = $derived(calls.length > 0 ? calls : defaultCalls);

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="rounded-lg border border-[var(--gray-4)] bg-[var(--theme-sidebar-background)] p-4 shadow-sm">
	<h3 class="text-sm font-semibold text-[var(--gray-10)] uppercase tracking-wider mb-3">Video Call History</h3>

	{#if displayCalls.length === 0}
		<p class="text-sm text-[var(--gray-7)] italic">No video calls recorded.</p>
	{:else}
		<ul class="space-y-2">
			{#each displayCalls as call (call.id)}
				<li class="flex items-start justify-between rounded-md border border-[var(--gray-4)] bg-[var(--gray-1)] p-3">
					<div class="space-y-1">
						<p class="text-sm font-medium text-[var(--gray-10)]">{call.roomName}</p>
						<p class="text-xs text-[var(--gray-7)]">{formatDate(call.date)} &middot; {call.duration}</p>
						<div class="flex flex-wrap gap-1 pt-1">
							{#each call.participants as p, i (p + i)}
								<span class="inline-flex items-center rounded-full bg-[var(--theme-primary)]/10 px-2 py-0.5 text-xs text-[var(--theme-primary)]">{p}</span>
							{/each}
						</div>
					</div>
					<svg class="w-5 h-5 text-[var(--gray-6)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
				</li>
			{/each}
		</ul>
	{/if}
</div>
