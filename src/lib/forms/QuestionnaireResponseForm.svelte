<script lang="ts">
	import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
	import type { WidgetRegistry } from './widgetRegistry';
	import type { ValidationError } from './validation';
	import { validateForm } from './validation';
	import { createAutoSave, clearDraft, type DraftConfig } from './draft';
	import { persistSaveService, persistWithProvenanceSaveService } from './saveService';
	import { getInitialExpression, getCalculatedExpression, evaluateExpression, expressionResultToAnswer, buildLaunchContext } from './expressions';
	import { flattenQuestionnaireItems } from './itemTree';
	import QuestionnaireItemComponent from './QuestionnaireItem.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Empty from '$lib/components/Empty.svelte';

	interface Props {
		questionnaire: Questionnaire;
		initialResponse?: Partial<QuestionnaireResponse>;
		subjectRef?: string;
		authorRef?: string;
		readonly?: boolean;
		widgetRegistry?: WidgetRegistry;
		draftConfig?: DraftConfig;
		saveService?: 'persist' | 'provenance';
		launchContext?: Array<{ name: string; resource: unknown }>;
		onSubmit?: (response: QuestionnaireResponse) => void;
		onSaveDraft?: (response: Partial<QuestionnaireResponse>) => void;
		onError?: (error: Error) => void;
	}

	let {
		questionnaire,
		initialResponse,
		subjectRef,
		authorRef,
		readonly = false,
		widgetRegistry = {},
		draftConfig,
		saveService = 'persist',
		launchContext = [],
		onSubmit,
		onSaveDraft,
		onError
	}: Props = $props();

	function createInitialResponse(): QuestionnaireResponse {
		return {
			resourceType: 'QuestionnaireResponse',
			questionnaire: questionnaire.id ? `Questionnaire/${questionnaire.id}` : undefined,
			status: 'in-progress',
			subject: subjectRef ? { reference: subjectRef } : undefined,
			author: authorRef ? { reference: authorRef } : undefined,
			item: [],
			...initialResponse
		};
	}

	let response = $state<QuestionnaireResponse>(createInitialResponse());

	$effect(() => {
		if (questionnaire.id || questionnaire.item) {
			response = createInitialResponse();
			evaluateInitialExpressions().catch(console.error);
		}
	});

	let validationErrors = $state<ValidationError[]>([]);
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);
	let enabledMap = $state(new Map<string, boolean>());

	const autoSave = $derived(draftConfig ? createAutoSave(draftConfig, (draft) => {
		onSaveDraft?.(draft);
	}) : null);

	const allItems = $derived(flattenQuestionnaireItems(questionnaire.item));
	const context = $derived(buildLaunchContext(launchContext));

	function getResponseItem(linkId: string): QuestionnaireResponseItem | undefined {
		return response.item?.find((ri) => ri.linkId === linkId);
	}

	function updateResponseItem(linkId: string, answers: QuestionnaireResponseItemAnswer[]) {
		const existing = response.item ?? [];
		const index = existing.findIndex((ri) => ri.linkId === linkId);
		if (index >= 0) {
			existing[index] = { ...existing[index], answer: answers, linkId };
		} else {
			existing.push({ linkId, answer: answers });
		}
		response = { ...response, item: [...existing] };
		validationErrors = validationErrors.filter((e) => e.linkId !== linkId);
		autoSave?.save(response);
	}

	async function evaluateInitialExpressions() {
		for (const item of allItems) {
			const expression = getInitialExpression(item);
			if (expression) {
				const result = await evaluateExpression(expression, response, context);
				const answer = expressionResultToAnswer(result, item.type ?? 'string');
				if (answer) {
					updateResponseItem(item.linkId, [answer]);
				}
			}
		}
	}

	async function evaluateCalculatedExpressions() {
		let changed = false;
		const updatedItem = [...(response.item ?? [])];
		for (const item of allItems) {
			const expression = getCalculatedExpression(item);
			if (expression) {
				const result = await evaluateExpression(expression, response, context);
				const answer = expressionResultToAnswer(result, item.type ?? 'string');
				if (answer) {
					const index = updatedItem.findIndex((ri) => ri.linkId === item.linkId);
					if (index >= 0) {
						updatedItem[index] = { ...updatedItem[index], answer: [answer], linkId: item.linkId };
					} else {
						updatedItem.push({ linkId: item.linkId, answer: [answer] });
					}
					changed = true;
				}
			}
		}
		if (changed) {
			response = { ...response, item: updatedItem };
		}
	}

	function buildFullResponseItems(
		qItems: typeof questionnaire.item,
		rItems: QuestionnaireResponseItem[] = []
	): QuestionnaireResponseItem[] {
		if (!qItems) return rItems;
		return qItems.map((qItem) => {
			const existing = rItems.find((ri) => ri.linkId === qItem.linkId);
			const children = qItem.item ? buildFullResponseItems(qItem.item, existing?.item) : undefined;
			return {
				linkId: qItem.linkId,
				answer: existing?.answer,
				item: children
			};
		});
	}

	$effect(() => {
		if (questionnaire.item && (!response.item || response.item.length === 0)) {
			response = {
				...response,
				item: buildFullResponseItems(questionnaire.item)
			};
		}
	});

	$effect(() => {
		// Evaluate calculated expressions whenever response items change
		if (response.item && response.item.length > 0) {
			evaluateCalculatedExpressions().catch(console.error);
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const errors = validateForm(questionnaire.item, response.item, enabledMap);
		if (errors.length > 0) {
			validationErrors = errors;
			const firstErrorLinkId = errors[0]?.linkId;
			if (firstErrorLinkId) {
				const firstError = document.querySelector(`[data-linkid="${firstErrorLinkId}"]`);
				firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		isSubmitting = true;
		submitError = null;

		try {
			const finalResponse: QuestionnaireResponse = {
				...response,
				status: 'completed'
			};

			let saved: QuestionnaireResponse;
			if (saveService === 'provenance') {
				const result = await persistWithProvenanceSaveService(finalResponse, {
					authorReference: authorRef,
					patientReference: subjectRef
				});
				saved = result.response;
			} else {
				saved = await persistSaveService(finalResponse);
			}

			if (draftConfig) {
				clearDraft(draftConfig);
			}

			onSubmit?.(saved);
		} catch (err) {
			submitError = err instanceof Error ? err.message : String(err);
			onError?.(err instanceof Error ? err : new Error(String(err)));
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		window.history.back();
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if questionnaire.title}
		<h2 class="text-xl font-bold mb-4">{questionnaire.title}</h2>
	{/if}

	{#if submitError}
		<div class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 mb-4">
			{submitError}
		</div>
	{/if}

	{#if questionnaire.item}
		{#each questionnaire.item as item (item.linkId)}
			<QuestionnaireItemComponent
				{item}
				responseItem={getResponseItem(item.linkId)}
				onChange={updateResponseItem}
				{readonly}
				{validationErrors}
				registry={widgetRegistry}
				{enabledMap}
				responseItems={response.item}
			/>
		{/each}
	{:else}
		<Empty message="This questionnaire has no items." />
	{/if}

	{#if !readonly}
		<div class="flex gap-3 pt-4 border-t">
			<button
				type="submit"
				disabled={isSubmitting}
				class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
			>
				{#if isSubmitting}
					<span class="flex items-center gap-2">
						<Spinner />
						Submitting...
					</span>
				{:else}
					Submit
				{/if}
			</button>
			<button
				type="button"
				onclick={handleCancel}
				class="px-4 py-2 border rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
			>
				Cancel
			</button>
		</div>
	{/if}
</form>
