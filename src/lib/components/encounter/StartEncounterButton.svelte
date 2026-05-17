<script lang="ts">
	import StartEncounterModal from '$lib/components/encounter/StartEncounterModal.svelte';

	interface Props {
		patientId: string;
		variant?: 'default' | 'compact';
	}

	let { patientId, variant = 'default' }: Props = $props();

	let modalOpen = $state(false);

	function openModal() {
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}
</script>

{#if variant === 'compact'}
	<button
		onclick={openModal}
		class="px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:opacity-90 flex items-center gap-1"
		title="Start Encounter"
	>
		<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>Start</span>
	</button>
{:else}
	<button
		onclick={openModal}
		class="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 flex items-center gap-2"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>Start Encounter</span>
	</button>
{/if}

<StartEncounterModal open={modalOpen} {patientId} onClose={closeModal} />
