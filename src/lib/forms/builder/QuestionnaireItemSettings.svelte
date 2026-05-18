<script lang="ts">
	import type { QuestionnaireItem } from 'fhir/r4b';

	interface Props {
		item: QuestionnaireItem | null;
		allItems: QuestionnaireItem[];
		onUpdate: (updatedItem: QuestionnaireItem) => void;
		onDelete: (linkId: string) => void;
	}

	let { item, allItems, onUpdate, onDelete }: Props = $props();

	const itemTypes = [
		{ value: 'string', label: 'Text' },
		{ value: 'integer', label: 'Integer' },
		{ value: 'decimal', label: 'Decimal' },
		{ value: 'date', label: 'Date' },
		{ value: 'dateTime', label: 'Date & Time' },
		{ value: 'boolean', label: 'Yes/No' },
		{ value: 'choice', label: 'Choice' },
		{ value: 'open-choice', label: 'Open Choice' },
		{ value: 'reference', label: 'Reference' },
		{ value: 'quantity', label: 'Quantity' },
		{ value: 'attachment', label: 'Attachment' },
		{ value: 'group', label: 'Group' },
		{ value: 'display', label: 'Display' }
	];

	const operators = [
		{ value: 'exists', label: 'Exists' },
		{ value: '=', label: 'Equals' },
		{ value: '!=', label: 'Not equals' },
		{ value: '>', label: 'Greater than' },
		{ value: '<', label: 'Less than' },
		{ value: '>=', label: 'Greater than or equal' },
		{ value: '<=', label: 'Less than or equal' }
	];

	let optionsText = $state('');
	let enableWhenList = $state<Array<NonNullable<QuestionnaireItem['enableWhen']>[number]>>([]);

	$effect(() => {
		if (item?.answerOption) {
			optionsText = item.answerOption
				.map((opt) => opt.valueCoding?.display ?? opt.valueCoding?.code ?? opt.valueString ?? '')
				.filter(Boolean)
				.join('\n');
		} else {
			optionsText = '';
		}
		enableWhenList = item?.enableWhen ? [...item.enableWhen] : [];
	});

	function updateField<K extends keyof QuestionnaireItem>(field: K, value: QuestionnaireItem[K]) {
		if (!item) return;
		onUpdate({ ...item, [field]: value });
	}

	function updateOptions() {
		if (!item) return;
		const lines = optionsText.split('\n').map((l) => l.trim()).filter(Boolean);
		const answerOption = lines.map((line) => ({ valueString: line }));
		onUpdate({ ...item, answerOption });
	}

	function addEnableWhen() {
		enableWhenList = [
			...enableWhenList,
			{ question: '', operator: '=', answerString: '' }
		];
	}

	function updateEnableWhen(index: number, patch: Partial<NonNullable<QuestionnaireItem['enableWhen']>[number]>) {
		enableWhenList = enableWhenList.map((ew, i) => (i === index ? { ...ew, ...patch } : ew));
	}

	function removeEnableWhen(index: number) {
		enableWhenList = enableWhenList.filter((_, i) => i !== index);
	}

	function saveEnableWhen() {
		if (!item) return;
		onUpdate({ ...item, enableWhen: enableWhenList.length > 0 ? enableWhenList : undefined });
	}

	const otherItems = $derived(
		allItems.filter((i) => i.linkId !== item?.linkId)
	);
</script>

{#if item}
	<div class="space-y-4">
		<div>
			<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Text</label>
			<input
				type="text"
				value={item.text || ''}
				oninput={(e) => updateField('text', e.currentTarget.value)}
				class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<div>
			<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
			<select
				value={item.type}
				onchange={(e) => updateField('type', e.currentTarget.value as QuestionnaireItem['type'])}
				class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white"
			>
			{#each itemTypes as t (t.value)}
				<option value={t.value}>{t.label}</option>
			{/each}
			</select>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="required-check"
				checked={item.required || false}
				onchange={(e) => updateField('required', e.currentTarget.checked)}
				class="rounded border-gray-300 text-primary focus:ring-primary"
			/>
			<label for="required-check" class="text-sm text-gray-700 dark:text-gray-300">Required</label>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="repeats-check"
				checked={item.repeats || false}
				onchange={(e) => updateField('repeats', e.currentTarget.checked)}
				class="rounded border-gray-300 text-primary focus:ring-primary"
			/>
			<label for="repeats-check" class="text-sm text-gray-700 dark:text-gray-300">Repeats</label>
		</div>

		<div>
			<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Length</label>
			<input
				type="number"
				value={item.maxLength || ''}
				oninput={(e) => updateField('maxLength', e.currentTarget.value ? parseInt(e.currentTarget.value, 10) : undefined)}
				class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
			/>
		</div>

		{#if item.type === 'choice' || item.type === 'open-choice'}
			<div>
				<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
					Options (one per line)
				</label>
				<textarea
					value={optionsText}
					oninput={(e) => {
						optionsText = e.currentTarget.value;
						updateOptions();
					}}
					rows="4"
					class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
				></textarea>
			</div>
		{/if}

		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-medium text-gray-500 dark:text-gray-400">Enable When</label>
				<button
					onclick={addEnableWhen}
					class="text-xs text-primary hover:underline"
				>
					+ Add rule
				</button>
			</div>
			<div class="space-y-2">
				{#each enableWhenList as ew, idx (idx)}
					<div class="p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
						<select
							value={ew.question}
							onchange={(e) => updateEnableWhen(idx, { question: e.currentTarget.value })}
							class="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
						>
							<option value="">-- Select question --</option>
							{#each otherItems as oi (oi.linkId)}
								<option value={oi.linkId}>{oi.text || oi.linkId}</option>
							{/each}
						</select>
						<select
							value={ew.operator}
							onchange={(e) => updateEnableWhen(idx, { operator: e.currentTarget.value as typeof ew.operator })}
							class="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
						>
							{#each operators as op (op.value)}
								<option value={op.value}>{op.label}</option>
							{/each}
						</select>
						<input
							type="text"
							value={ew.answerString || ''}
							oninput={(e) => updateEnableWhen(idx, { answerString: e.currentTarget.value })}
							placeholder="Answer value"
							class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
						/>
						<button
							onclick={() => removeEnableWhen(idx)}
							class="mt-1 text-xs text-red-500 hover:underline"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>
			{#if enableWhenList.length > 0}
				<button
					onclick={saveEnableWhen}
					class="mt-2 text-xs px-3 py-1 bg-primary text-white rounded hover:opacity-90"
				>
					Save rules
				</button>
			{/if}
		</div>

		<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
			<button
				onclick={() => onDelete(item.linkId)}
				class="w-full px-3 py-2 text-sm text-red-600 border border-red-200 dark:border-red-800 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
			>
				Delete Item
			</button>
		</div>
	</div>
{:else}
	<div class="text-sm text-gray-400 text-center py-8">
		Select an item to configure
	</div>
{/if}
