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

	let startTime = $state('');
	let endTime = $state('');

	$effect(() => {
		try {
			const parsed = JSON.parse(answer?.valueString || '{}') as { start?: string; end?: string };
			startTime = parsed.start ?? '';
			endTime = parsed.end ?? '';
		} catch {
			startTime = '';
			endTime = '';
		}
	});

	function handleChange() {
		const value = JSON.stringify({ start: startTime || undefined, end: endTime || undefined });
		onChange({ valueString: value === '{}' ? '' : value });
	}

	function handleStartChange(e: Event) {
		startTime = (e.target as HTMLInputElement).value;
		handleChange();
	}

	function handleEndChange(e: Event) {
		endTime = (e.target as HTMLInputElement).value;
		handleChange();
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm">
			{startTime || '—'} to {endTime || '—'}
		</div>
	{:else}
		<div class="flex items-center gap-2">
			<div class="flex-1">
				<label class="text-xs text-gray-500 dark:text-gray-400 mb-0.5 block">Start</label>
				<input
					id="{item.linkId}-start"
					type="time"
					value={startTime}
					oninput={handleStartChange}
					class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white text-sm"
				/>
			</div>
			<span class="text-gray-400 pt-5">→</span>
			<div class="flex-1">
				<label class="text-xs text-gray-500 dark:text-gray-400 mb-0.5 block">End</label>
				<input
					id="{item.linkId}-end"
					type="time"
					value={endTime}
					oninput={handleEndChange}
					class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white text-sm"
				/>
			</div>
		</div>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
