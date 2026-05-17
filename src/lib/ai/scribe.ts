export interface ScribeState {
	isListening: boolean;
	transcript: string;
	error: string | null;
}

// Minimal SpeechRecognition type shims for cross-browser support
interface SpeechRecognitionCtor {
	new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionEvent extends Event {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	length: number;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	[index: number]: { transcript: string };
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
}

let recognition: SpeechRecognitionInstance | null = null;
let transcriptAccumulator = '';

function getSpeechRecognition(): SpeechRecognitionInstance | null {
	if (typeof window === 'undefined') return null;
	const ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
		|| (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
	if (!ctor) return null;
	return new ctor();
}

export function startScribe(encounterId: string, onUpdate?: (state: ScribeState) => void): ScribeState {
	if (recognition) {
		stopScribe();
	}
	const rec = getSpeechRecognition();
	if (!rec) {
		const state: ScribeState = { isListening: false, transcript: transcriptAccumulator, error: 'Speech recognition not supported in this browser' };
		onUpdate?.(state);
		return state;
	}

	recognition = rec;
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.lang = 'en-US';

	recognition.onresult = (event: SpeechRecognitionEvent) => {
		let interim = '';
		for (let i = event.resultIndex; i < event.results.length; i++) {
			const result = event.results[i];
			if (result && result[0]) {
				if (result.isFinal) {
					transcriptAccumulator += result[0].transcript + ' ';
				} else {
					interim += result[0].transcript;
				}
			}
		}
		const state: ScribeState = { isListening: true, transcript: transcriptAccumulator + interim, error: null };
		onUpdate?.(state);
	};

	recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
		const state: ScribeState = { isListening: false, transcript: transcriptAccumulator, error: event.error };
		onUpdate?.(state);
	};

	recognition.onend = () => {
		const state: ScribeState = { isListening: false, transcript: transcriptAccumulator, error: null };
		onUpdate?.(state);
	};

	recognition.start();
	const state: ScribeState = { isListening: true, transcript: transcriptAccumulator, error: null };
	onUpdate?.(state);
	return state;
}

export function stopScribe(): ScribeState {
	if (recognition) {
		try {
			recognition.stop();
		} catch {
			// ignore
		}
		recognition = null;
	}
	return { isListening: false, transcript: transcriptAccumulator, error: null };
}

export function getTranscript(): string {
	return transcriptAccumulator;
}

export function clearTranscript(): void {
	transcriptAccumulator = '';
}
