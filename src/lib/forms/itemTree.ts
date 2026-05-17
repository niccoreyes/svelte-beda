import type { QuestionnaireItem } from 'fhir/r4b';

export function flattenQuestionnaireItems(items: QuestionnaireItem[] | undefined): QuestionnaireItem[] {
	if (!items) return [];
	const result: QuestionnaireItem[] = [];
	for (const item of items) {
		result.push(item);
		if (item.item) {
			result.push(...flattenQuestionnaireItems(item.item));
		}
	}
	return result;
}

export function findItemByLinkId(items: QuestionnaireItem[] | undefined, linkId: string): QuestionnaireItem | undefined {
	if (!items) return undefined;
	for (const item of items) {
		if (item.linkId === linkId) return item;
		if (item.item) {
			const found = findItemByLinkId(item.item, linkId);
			if (found) return found;
		}
	}
	return undefined;
}
