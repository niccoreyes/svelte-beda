<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		open?: boolean;
		onToggle?: () => void;
		patientId?: string;
		encounterId?: string;
	}

	let { open = false, onToggle, patientId, encounterId }: Props = $props();

	interface ChatMessage {
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
	}

	let messages = $state<ChatMessage[]>([
		{
			role: 'assistant',
			content: 'Hello! I am your AI assistant. How can I help you today?',
			timestamp: new Date()
		}
	]);
	let inputText = $state('');
	let isRecording = $state(false);
	let recognition: any = null;
	let volumeLevel = $state(0);

	const suggestedCommands = $derived([
		...(patientId ? ['Show patient summary'] : []),
		...(encounterId ? ['Start encounter'] : []),
		'Add note',
		...(patientId ? ['Show allergies'] : [])
	]);

	function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	}

	function startRecording() {
		if (typeof window === 'undefined') return;
		const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (!SpeechRecognitionAPI) {
			addMessage('assistant', 'Speech recognition is not supported in your browser.');
			return;
		}

		recognition = new SpeechRecognitionAPI();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = 'en-US';

		recognition.onstart = () => {
			isRecording = true;
			volumeLevel = 1;
		};

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let transcript = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				transcript += event.results[i]![0]!.transcript;
			}
			inputText = transcript;
		};

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			isRecording = false;
			volumeLevel = 0;
			console.error('Speech recognition error:', event.error);
		};

		recognition.onend = () => {
			isRecording = false;
			volumeLevel = 0;
		};

		recognition.start();
	}

	function stopRecording() {
		recognition?.stop();
		isRecording = false;
		volumeLevel = 0;
	}

	function addMessage(role: 'user' | 'assistant', content: string) {
		messages = [...messages, { role, content, timestamp: new Date() }];
	}

	function handleCommand(command: string) {
		addMessage('user', command);

		const lower = command.toLowerCase();

		if (lower.includes('patient summary') && patientId) {
			goto(`/patients/${patientId}`);
			addMessage('assistant', 'Navigating to patient summary...');
		} else if (lower.includes('start encounter') && patientId) {
			goto(`/patients/${patientId}/encounters`);
			addMessage('assistant', 'Navigating to encounters to start a new one...');
		} else if (lower.includes('add note') && encounterId) {
			goto(`/patients/${patientId}/encounters/${encounterId}`);
			addMessage('assistant', 'Navigating to encounter workspace to add a note...');
		} else if (lower.includes('allergies') && patientId) {
			goto(`/patients/${patientId}`);
			addMessage('assistant', 'Navigating to patient overview where allergies are shown...');
		} else {
			addMessage('assistant', `I understood "${command}". I'm a demo assistant with limited command support. Try: ${suggestedCommands.join(', ')}`);
		}
	}

	function handleSend() {
		const text = inputText.trim();
		if (!text) return;
		inputText = '';
		handleCommand(text);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	// Simulate volume animation when recording
	let volumeInterval: ReturnType<typeof setInterval>;
	$effect(() => {
		if (isRecording) {
			volumeInterval = setInterval(() => {
				volumeLevel = Math.random() * 0.8 + 0.2;
			}, 200);
		} else {
			volumeLevel = 0;
		}
		return () => {
			clearInterval(volumeInterval);
		};
	});
</script>

{#if open}
	<div
		class="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
				<h3 class="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
			</div>
			<button
				class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
				onclick={onToggle}
				aria-label="Close sidebar"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Chat Area -->
		<div class="flex-1 overflow-y-auto p-4 space-y-3">
			{#each messages as msg}
				<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div
						class="max-w-[85%] rounded-lg px-3 py-2 text-sm {msg.role === 'user'
							? 'bg-primary text-white'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}"
					>
						{msg.content}
					</div>
				</div>
			{/each}
		</div>

		<!-- Suggested Commands -->
		{#if suggestedCommands.length > 0}
			<div class="px-3 pb-2 flex flex-wrap gap-1.5">
				{#each suggestedCommands as cmd}
					<button
						class="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
						onclick={() => handleCommand(cmd)}
					>
						{cmd}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Voice Wave Animation -->
		{#if isRecording}
			<div class="flex items-center justify-center gap-1 px-4 py-2">
				{#each [0.6, 0.8, 1, 0.8, 0.6] as baseHeight, i}
					<div
						class="w-1.5 rounded-full bg-primary transition-all duration-150"
						style="height: {Math.max(8, baseHeight * 40 * (0.5 + volumeLevel * 0.5 + Math.sin(Date.now() / 200 + i) * 0.3))}px;"
					></div>
				{/each}
			</div>
		{/if}

		<!-- Input Area -->
		<div class="p-3 border-t border-gray-200 dark:border-gray-700">
			<div class="flex items-end gap-2">
				<button
					class="p-2 rounded-full transition-colors {isRecording
						? 'bg-red-500 text-white animate-pulse'
						: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}"
					onclick={toggleRecording}
					aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
					</svg>
				</button>
				<textarea
					class="flex-1 min-h-[40px] max-h-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
					placeholder="Type a command or use voice..."
					bind:value={inputText}
					onkeydown={handleKeydown}
					rows={1}
				></textarea>
				<button
					class="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
					onclick={handleSend}
					disabled={!inputText.trim()}
					aria-label="Send message"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if}
