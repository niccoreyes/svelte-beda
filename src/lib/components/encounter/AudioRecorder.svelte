<script lang="ts">
	let recording = $state(false);
	let audioBlob = $state<Blob | null>(null);
	let audioUrl = $state<string | null>(null);
	let mediaRecorder = $state<MediaRecorder | null>(null);
	let chunks = $state<Blob[]>([]);
	let error = $state('');
	let duration = $state(0);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);

	async function startRecording() {
		error = '';
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mr = new MediaRecorder(stream);
			mediaRecorder = mr;
			chunks = [];
			mr.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.push(e.data);
			};
			mr.onstop = () => {
				const blob = new Blob(chunks, { type: 'audio/webm' });
				audioBlob = blob;
				audioUrl = URL.createObjectURL(blob);
				chunks = [];
				stream.getTracks().forEach((t) => t.stop());
			};
			mr.start();
			recording = true;
			duration = 0;
			timerInterval = setInterval(() => {
				duration++;
			}, 1000);
		} catch (e) {
			error = 'Microphone access denied or unavailable';
		}
	}

	function stopRecording() {
		mediaRecorder?.stop();
		recording = false;
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function discardRecording() {
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		audioBlob = null;
		audioUrl = null;
		duration = 0;
	}

	function downloadRecording() {
		if (!audioBlob) return;
		const url = URL.createObjectURL(audioBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `recording_${new Date().toISOString()}.webm`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60).toString().padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}
</script>

<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">Audio Recorder</h3>
		{#if recording}
			<span class="text-sm text-red-500 font-mono">{formatDuration(duration)}</span>
		{/if}
	</div>

	{#if error}
		<div class="text-sm text-red-600 dark:text-red-400">{error}</div>
	{/if}

	<div class="flex items-center gap-3">
		{#if !recording && !audioUrl}
			<button
				onclick={startRecording}
				class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
			>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="6" />
				</svg>
				Record
			</button>
		{:else if recording}
			<button
				onclick={stopRecording}
				class="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors animate-pulse"
			>
				<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="6" width="12" height="12" rx="2" />
				</svg>
				Stop
			</button>
		{:else if audioUrl}
			<audio src={audioUrl} controls class="w-full max-w-xs"></audio>
			<div class="flex gap-2">
				<button
					onclick={downloadRecording}
					class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					Download
				</button>
				<button
					onclick={discardRecording}
					class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
				>
					Discard
				</button>
			</div>
		{/if}
	</div>
</div>
