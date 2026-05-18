<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';

	interface Props {
		item: QuestionnaireItem;
		answer?: QuestionnaireResponseItemAnswer;
		onChange: (answer: QuestionnaireResponseItemAnswer) => void;
		readonly?: boolean;
		error?: string;
	}

	let { item, answer, onChange, readonly = false, error }: Props = $props();

	let transcribedText = $state(answer?.valueString ?? '');
	let isRecording = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let recognition: any | null = null;
	let transcriptParts: string[] = [];

	function startRecording() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const w = window as any;
		if (!w.webkitSpeechRecognition && !w.SpeechRecognition) {
			alert('Voice input is not supported in this browser.');
			return;
		}
		const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
		recognition = new SpeechRecognitionAPI();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';

		transcriptParts = transcribedText ? [transcribedText] : [];
		isRecording = true;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		recognition.onresult = (event: any) => {
			let interim = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results.item(i);
				if (!result) continue;
				const alt = result.item(0);
				if (!alt) continue;
				if (result.isFinal) {
					transcriptParts.push(alt.transcript);
				} else {
					interim = alt.transcript;
				}
			}
			transcribedText = transcriptParts.join(' ') + (interim ? ' ' + interim : '');
		};

		recognition.onerror = () => {
			isRecording = false;
		};

		recognition.onend = () => {
			isRecording = false;
			transcribedText = transcriptParts.join(' ').trim();
			onChange({ valueString: transcribedText });
		};

		recognition.start();
	}

	function stopRecording() {
		recognition?.stop();
		isRecording = false;
	}

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}

	function clearTranscript() {
		transcribedText = '';
		transcriptParts = [];
		onChange({ valueString: '' });
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm">{transcribedText || 'No transcription'}</div>
	{:else}
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={toggleRecording}
					class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors {isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:opacity-90'}"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if isRecording}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
						{/if}
					</svg>
					{isRecording ? 'Stop Recording' : 'Record Voice'}
				</button>
				{#if transcribedText}
					<button
						type="button"
						onclick={clearTranscript}
						class="px-3 py-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
					>
						Clear
					</button>
				{/if}
			</div>
			{#if isRecording}
				<div class="flex items-center gap-1">
					{#each [1, 2, 3, 4] as i (i)}
						<div
							class="w-1 bg-red-500 rounded-full animate-pulse"
							style="height: {12 + Math.random() * 16}px; animation-delay: {i * 0.1}s"
						></div>
					{/each}
					<span class="text-xs text-gray-500 ml-2">Listening...</span>
				</div>
			{/if}
			{#if transcribedText}
				<div class="p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
					{transcribedText}
				</div>
			{/if}
		</div>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
