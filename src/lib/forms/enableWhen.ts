import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';

export type AnswerValue =
	| { valueString: string }
	| { valueInteger: number }
	| { valueDecimal: number }
	| { valueDate: string }
	| { valueDateTime: string }
	| { valueTime: string }
	| { valueBoolean: boolean }
	| { valueCoding: { code: string; system?: string; display?: string } }
	| { valueQuantity: { value: number; unit?: string; system?: string; code?: string } }
	| { valueReference: { reference: string; display?: string } }
	| { valueAttachment: { contentType?: string; data?: string; url?: string; title?: string } };

export function getAnswerValue(answer: QuestionnaireResponseItemAnswer | undefined): unknown {
	if (!answer) return undefined;
	if (answer.valueString !== undefined) return answer.valueString;
	if (answer.valueInteger !== undefined) return answer.valueInteger;
	if (answer.valueDecimal !== undefined) return answer.valueDecimal;
	if (answer.valueDate !== undefined) return answer.valueDate;
	if (answer.valueDateTime !== undefined) return answer.valueDateTime;
	if (answer.valueTime !== undefined) return answer.valueTime;
	if (answer.valueBoolean !== undefined) return answer.valueBoolean;
	if (answer.valueCoding !== undefined) return answer.valueCoding.code;
	if (answer.valueQuantity !== undefined) return answer.valueQuantity.value;
	if (answer.valueReference !== undefined) return answer.valueReference.reference;
	if (answer.valueAttachment !== undefined) return answer.valueAttachment.url || answer.valueAttachment.data;
	return undefined;
}

export function getAnswersByLinkId(
	items: QuestionnaireResponseItem[] | undefined,
	linkId: string
): QuestionnaireResponseItemAnswer[] | undefined {
	if (!items) return undefined;
	for (const item of items) {
		if (item.linkId === linkId) {
			return item.answer;
		}
		if (item.item) {
			const found = getAnswersByLinkId(item.item, linkId);
			if (found) return found;
		}
	}
	return undefined;
}

export function evaluateEnableWhen(
	item: QuestionnaireItem,
	responseItems: QuestionnaireResponseItem[] | undefined
): boolean {
	if (!item.enableWhen || item.enableWhen.length === 0) {
		return true;
	}

	const results = item.enableWhen.map((condition) => {
		const answers = getAnswersByLinkId(responseItems, condition.question);
		if (!answers || answers.length === 0) {
			return condition.operator === 'exists' ? false : false;
		}

		const answerValue = getAnswerValue(answers[0]);

		switch (condition.operator) {
			case 'exists':
				return answers.length > 0 && answerValue !== undefined && answerValue !== null && answerValue !== '';
			case '=':
				return compareValues(answerValue, condition.answerBoolean ?? condition.answerDecimal ?? condition.answerInteger ?? condition.answerString ?? condition.answerDate ?? condition.answerDateTime ?? condition.answerTime ?? condition.answerCoding?.code ?? condition.answerQuantity?.value ?? condition.answerReference?.reference);
			case '!=':
				return !compareValues(answerValue, condition.answerBoolean ?? condition.answerDecimal ?? condition.answerInteger ?? condition.answerString ?? condition.answerDate ?? condition.answerDateTime ?? condition.answerTime ?? condition.answerCoding?.code ?? condition.answerQuantity?.value ?? condition.answerReference?.reference);
			case '>':
				return compareGreaterThan(answerValue, condition.answerDecimal ?? condition.answerInteger ?? condition.answerQuantity?.value);
			case '<':
				return compareLessThan(answerValue, condition.answerDecimal ?? condition.answerInteger ?? condition.answerQuantity?.value);
			case '>=':
				return compareGreaterThanOrEqual(answerValue, condition.answerDecimal ?? condition.answerInteger ?? condition.answerQuantity?.value);
			case '<=':
				return compareLessThanOrEqual(answerValue, condition.answerDecimal ?? condition.answerInteger ?? condition.answerQuantity?.value);
			default:
				return false;
		}
	});

	if (item.enableBehavior === 'any') {
		return results.some(Boolean);
	}
	return results.every(Boolean);
}

function compareValues(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a === 'number' && typeof b === 'number') return a === b;
	if (typeof a === 'string' && typeof b === 'string') return a === b;
	if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
	return String(a) === String(b);
}

function compareGreaterThan(a: unknown, b: unknown): boolean {
	if (typeof a === 'number' && typeof b === 'number') return a > b;
	if (typeof a === 'string' && typeof b === 'string') return a > b;
	return false;
}

function compareLessThan(a: unknown, b: unknown): boolean {
	if (typeof a === 'number' && typeof b === 'number') return a < b;
	if (typeof a === 'string' && typeof b === 'string') return a < b;
	return false;
}

function compareGreaterThanOrEqual(a: unknown, b: unknown): boolean {
	if (typeof a === 'number' && typeof b === 'number') return a >= b;
	if (typeof a === 'string' && typeof b === 'string') return a >= b;
	return false;
}

function compareLessThanOrEqual(a: unknown, b: unknown): boolean {
	if (typeof a === 'number' && typeof b === 'number') return a <= b;
	if (typeof a === 'string' && typeof b === 'string') return a <= b;
	return false;
}
