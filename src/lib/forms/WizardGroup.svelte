<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
	import QuestionnaireItemComponent from './QuestionnaireItem.svelte';
	import { evaluateEnableWhen } from './enableWhen';
	import type { ValidationError } from './validation';

	interface Props {
		item: QuestionnaireItem;
		responseItem?: QuestionnaireResponseItem;
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
	let currentStep = $state(0);

	$effect(() => {
		enabledMap.set(item.linkId, isEnabled);
	});

	function handleChildChange(childLinkId: string, answers: QuestionnaireResponseItemAnswer[]) {
		onChange(childLinkId, answers);
	}

	function goToStep(step: number) {
		currentStep = step;
	}

	function nextStep() {
		if (item.item && currentStep < item.item.length - 1) {
			currentStep++;
		}
	}

	function previousStep() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	const children = $derived(item.item ?? []);
	const currentChild = $derived(children[currentStep]);
</script>

{#if isEnabled}
	<div class="wizard-group mb-4" data-linkid={item.linkId}>
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold">{item.text ?? item.linkId}</h3>
			<span class="text-sm text-gray-500">Step {currentStep + 1} of {children.length}</span>
		</div>

		<div class="flex gap-2 mb-4">
			{#each children as _, index}
				<button
					class="flex-1 h-2 rounded-full transition-colors {index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/50' : 'bg-gray-200'}"
					onclick={() => goToStep(index)}
					aria-label="Go to step {index + 1}"
				></button>
			{/each}
		</div>

		{#if currentChild}
			<QuestionnaireItemComponent
				item={currentChild}
				responseItem={responseItems?.find((ri) => ri.linkId === currentChild.linkId)}
				onChange={handleChildChange}
				{readonly}
				{validationErrors}
				{enabledMap}
				{responseItems}
			/>
		{/if}

		{#if !readonly}
			<div class="flex gap-3 mt-4 pt-4 border-t">
				<button
					type="button"
					disabled={currentStep === 0}
					onclick={previousStep}
					class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
				>
					Previous
				</button>
				<button
					type="button"
					disabled={currentStep >= children.length - 1}
					onclick={nextStep}
					class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	</div>
{/if}
