import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4b';
import { getAnswerValue, getAnswersByLinkId } from './enableWhen';

export interface ValidationError {
	linkId: string;
	message: string;
}

export function validateForm(
	questionnaireItems: QuestionnaireItem[] | undefined,
	responseItems: QuestionnaireResponseItem[] | undefined,
	enabledMap: Map<string, boolean>
): ValidationError[] {
	const errors: ValidationError[] = [];
	if (!questionnaireItems) return errors;

	for (const item of questionnaireItems) {
		const isEnabled = enabledMap.get(item.linkId) ?? true;
		if (!isEnabled) continue;

		const answers = getAnswersByLinkId(responseItems, item.linkId);
		const answerValue = answers?.[0] ? getAnswerValue(answers[0]) : undefined;

		if (item.required && (answerValue === undefined || answerValue === '' || answerValue === null)) {
			errors.push({ linkId: item.linkId, message: 'This field is required' });
		}

		if (answerValue !== undefined && answerValue !== '' && answerValue !== null) {
			if (item.maxLength && typeof answerValue === 'string' && answerValue.length > item.maxLength) {
				errors.push({
					linkId: item.linkId,
					message: `Maximum length is ${item.maxLength} characters`
				});
			}

			if (item.type === 'integer' && !Number.isInteger(Number(answerValue))) {
				errors.push({ linkId: item.linkId, message: 'Must be a valid integer' });
			}

			if (item.type === 'decimal' && isNaN(Number(answerValue))) {
				errors.push({ linkId: item.linkId, message: 'Must be a valid number' });
			}

			if (item.type === 'date' || item.type === 'dateTime') {
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (typeof answerValue === 'string' && !dateRegex.test(answerValue)) {
					errors.push({ linkId: item.linkId, message: 'Must be a valid date (YYYY-MM-DD)' });
				}
			}
		}

		if (item.item) {
			errors.push(...validateForm(item.item, responseItems, enabledMap));
		}
	}

	return errors;
}

export function hasValidationError(errors: ValidationError[], linkId: string): boolean {
	return errors.some((e) => e.linkId === linkId);
}

export function getValidationErrorMessage(errors: ValidationError[], linkId: string): string | undefined {
	return errors.find((e) => e.linkId === linkId)?.message;
}
