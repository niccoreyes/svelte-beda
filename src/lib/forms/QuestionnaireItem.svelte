<script lang="ts">
	import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
	import type { WidgetRegistry } from './widgetRegistry';
	import { getWidget, getItemControl, defaultRegistry, mergeWidgetRegistry } from './widgetRegistry';
	import { evaluateEnableWhen } from './enableWhen';
	import { getValidationErrorMessage } from './validation';
	import type { ValidationError } from './validation';
	import QuestionnaireItemComponent from './QuestionnaireItem.svelte';
	import WizardGroup from './WizardGroup.svelte';
	import TabsGroup from './TabsGroup.svelte';

	interface Props {
		item: QuestionnaireItem;
		responseItem?: QuestionnaireResponseItem;
		onChange: (linkId: string, answer: QuestionnaireResponseItemAnswer[]) => void;
		readonly?: boolean;
		validationErrors?: ValidationError[];
		registry?: WidgetRegistry;
		enabledMap?: Map<string, boolean>;
		responseItems?: QuestionnaireResponseItem[];
	}

	let {
		item,
		responseItem,
		onChange,
		readonly = false,
		validationErrors = [],
		registry = {},
		enabledMap = new Map(),
		responseItems = []
	}: Props = $props();

	const mergedRegistry = $derived(mergeWidgetRegistry(defaultRegistry, registry));

	const isEnabled = $derived(evaluateEnableWhen(item, responseItems));
	const itemControl = $derived(getItemControl(item));

	$effect(() => {
		enabledMap.set(item.linkId, isEnabled);
	});

	function handleAnswerChange(answer: QuestionnaireResponseItemAnswer) {
		if (Object.keys(answer).length === 0) {
			onChange(item.linkId, []);
		} else {
			onChange(item.linkId, [answer]);
		}
	}

	function handleChildChange(childLinkId: string, answers: QuestionnaireResponseItemAnswer[]) {
		onChange(childLinkId, answers);
	}

	const Widget = $derived(getWidget(mergedRegistry, item));
	const error = $derived(getValidationErrorMessage(validationErrors, item.linkId));
	const answer = $derived(responseItem?.answer?.[0]);
</script>

{#if isEnabled}
	<div class="questionnaire-item mb-4" data-linkid={item.linkId}>
		{#if item.type === 'group'}
			{#if itemControl === 'wizard'}
				<WizardGroup
					{item}
					onChange={handleChildChange}
					{readonly}
					{validationErrors}
					{enabledMap}
					{responseItems}
				/>
			{:else if itemControl === 'tabs'}
				<TabsGroup
					{item}
					onChange={handleChildChange}
					{readonly}
					{validationErrors}
					{enabledMap}
					{responseItems}
				/>
			{:else}
				<fieldset class="border rounded p-4">
					<legend class="text-sm font-semibold px-2">{item.text ?? item.linkId}</legend>
					{#if item.item}
						{#each item.item as child (child.linkId)}
							<QuestionnaireItemComponent
								item={child}
								responseItem={responseItems?.find((ri) => ri.linkId === child.linkId)}
								onChange={handleChildChange}
								{readonly}
								{validationErrors}
								{registry}
								{enabledMap}
								{responseItems}
							/>
						{/each}
					{/if}
				</fieldset>
			{/if}
		{:else if Widget}
			<Widget
				{item}
				{answer}
				onChange={handleAnswerChange}
				{readonly}
				{error}
			/>
		{:else}
			<div class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
				Unsupported widget type: {item.type} (control: {getItemControl(item) ?? 'default'})
			</div>
		{/if}
	</div>
{/if}
