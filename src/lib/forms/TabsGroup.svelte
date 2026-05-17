<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
	import QuestionnaireItemComponent from './QuestionnaireItem.svelte';
	import { evaluateEnableWhen } from './enableWhen';
	import type { ValidationError } from './validation';

	interface Props {
		item: QuestionnaireItem;
		onChange: (linkId: string, answer: QuestionnaireResponseItemAnswer[]) => void;
		readonly?: boolean;
		validationErrors?: ValidationError[];
		enabledMap?: Map<string, boolean>;
		responseItems?: QuestionnaireResponseItem[];
	}

	let {
		item,
		onChange,
		readonly = false,
		validationErrors = [],
		enabledMap = new Map(),
		responseItems = []
	}: Props = $props();

	const isEnabled = $derived(evaluateEnableWhen(item, responseItems));
	let activeTabIndex = $state(0);

	$effect(() => {
		enabledMap.set(item.linkId, isEnabled);
	});

	function handleChildChange(childLinkId: string, answers: QuestionnaireResponseItemAnswer[]) {
		onChange(childLinkId, answers);
	}

	const children = $derived(item.item ?? []);
	const activeChild = $derived(children[activeTabIndex]);
</script>

{#if isEnabled}
	<div class="tabs-group mb-4" data-linkid={item.linkId}>
		{#if item.text}
			<h3 class="text-lg font-semibold mb-3">{item.text}</h3>
		{/if}

		<div class="flex gap-1 border-b mb-4">
			{#each children as child, index}
				<button
					type="button"
					class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {index === activeTabIndex ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}"
					onclick={() => activeTabIndex = index}
				>
					{child.text ?? `Tab ${index + 1}`}
				</button>
			{/each}
		</div>

		{#if activeChild}
			<QuestionnaireItemComponent
				item={activeChild}
				responseItem={responseItems?.find((ri) => ri.linkId === activeChild.linkId)}
				onChange={handleChildChange}
				{readonly}
				{validationErrors}
				{enabledMap}
				{responseItems}
			/>
		{/if}
	</div>
{/if}
