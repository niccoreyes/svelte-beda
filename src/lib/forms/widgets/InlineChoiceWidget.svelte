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

	const options = $derived(item.answerOption ?? []);
	const isMulti = $derived(item.type === 'choice' && item.repeats);
	const isOpenChoice = $derived(item.type === 'open-choice');
	let openText = $state('');

	function getSelectedCodes(): string[] {
		if (isMulti) {
			return answer?.valueCoding?.code ? [answer.valueCoding.code] : [];
		}
		return answer?.valueCoding?.code ? [answer.valueCoding.code] : [];
	}

	let selectedCodes = $state<string[]>([]);

	$effect(() => {
		selectedCodes = getSelectedCodes();
	});

	function handleToggle(code: string) {
		if (isMulti) {
			if (selectedCodes.includes(code)) {
				selectedCodes = selectedCodes.filter((c) => c !== code);
			} else {
				selectedCodes = [...selectedCodes, code];
			}
			// For inline multi-choice, we need to emit each as separate answer in FHIR,
			// but our widget interface only supports single onChange. We emit the first for now.
			const firstCode = selectedCodes[0];
			const firstOption = options.find((opt) => opt.valueCoding?.code === firstCode);
			if (firstOption?.valueCoding) {
				onChange({ valueCoding: firstOption.valueCoding });
			} else {
				onChange({});
			}
		} else {
			selectedCodes = [code];
			const option = options.find((opt) => opt.valueCoding?.code === code);
			if (option?.valueCoding) {
				onChange({ valueCoding: option.valueCoding });
			} else {
				onChange({});
			}
		}
	}

	function isSelected(code: string): boolean {
		return selectedCodes.includes(code);
	}

	function handleOpenTextChange(e: Event) {
		openText = (e.target as HTMLInputElement).value;
		onChange({ valueString: openText });
	}
</script>

<div class="form-field">
	<label for={item.linkId} class="block text-sm font-medium mb-1">
		{item.text ?? item.linkId}
		{#if item.required}<span class="text-red-500">*</span>{/if}
	</label>
	{#if readonly}
		<div class="p-2 bg-gray-100 rounded text-sm">
			{#if isOpenChoice && openText}
				{openText}
			{:else}
				{answer?.valueCoding?.display ?? answer?.valueCoding?.code ?? answer?.valueString ?? '-'}
			{/if}
		</div>
	{:else}
		<div class="flex flex-wrap gap-3">
			{#each options as option}
				{@const code = option.valueCoding?.code || ''}
				{@const display = option.valueCoding?.display ?? option.valueCoding?.code ?? ''}
				<label class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
					<input
						type={isMulti ? 'checkbox' : 'radio'}
						name="{item.linkId}-inline"
						value={code}
						checked={isSelected(code)}
						onchange={() => handleToggle(code)}
						class="text-primary focus:ring-primary {isMulti ? 'rounded' : ''}"
					/>
					<span class="text-gray-700 dark:text-gray-300">{display}</span>
				</label>
			{/each}
			{#if isOpenChoice}
				<label class="inline-flex items-center gap-1.5 text-sm cursor-pointer flex-1 min-w-[120px]">
					<input
						type={isMulti ? 'checkbox' : 'radio'}
						name="{item.linkId}-inline"
						value="__other__"
						checked={!!openText}
						onchange={() => {}}
						class="text-primary focus:ring-primary {isMulti ? 'rounded' : ''}"
					/>
					<input
						type="text"
						value={openText}
						oninput={handleOpenTextChange}
						placeholder="Other..."
						class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary {error ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white flex-1"
					/>
				</label>
			{/if}
		</div>
	{/if}
	{#if error}<p class="text-red-500 text-xs mt-1">{error}</p>{/if}
</div>
