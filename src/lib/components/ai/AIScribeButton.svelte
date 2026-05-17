<script lang="ts">
	let processing = $state(false);

	function onClick() {
		processing = true;
		// Placeholder: in a real implementation, this would call the AI scribe service
		setTimeout(() => {
			processing = false;
			alert('AIScribe: Transcription service would be invoked here. (Placeholder)');
		}, 800);
	}
</script>

<button
	onclick={onClick}
	disabled={processing}
	class="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
>
	<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
	</svg>
	{processing ? 'Transcribing...' : 'AI Scribe'}
</button>
