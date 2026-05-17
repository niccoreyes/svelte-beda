import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4b';
import type { Component } from 'svelte';

import StringWidget from './widgets/StringWidget.svelte';
import IntegerWidget from './widgets/IntegerWidget.svelte';
import DecimalWidget from './widgets/DecimalWidget.svelte';
import DateWidget from './widgets/DateWidget.svelte';
import BooleanWidget from './widgets/BooleanWidget.svelte';
import ChoiceWidget from './widgets/ChoiceWidget.svelte';
import ReferenceWidget from './widgets/ReferenceWidget.svelte';
import QuantityWidget from './widgets/QuantityWidget.svelte';
import AttachmentWidget from './widgets/AttachmentWidget.svelte';
import PhoneWidget from './widgets/PhoneWidget.svelte';
import SliderWidget from './widgets/SliderWidget.svelte';
import MarkdownWidget from './widgets/MarkdownWidget.svelte';
import BarcodeWidget from './widgets/BarcodeWidget.svelte';
import GroupVoiceWidget from './widgets/GroupVoiceWidget.svelte';
import GroupTabsWidget from './widgets/GroupTabsWidget.svelte';
import TimeRangePickerWidget from './widgets/TimeRangePickerWidget.svelte';
import UploadFileControlWidget from './widgets/UploadFileControlWidget.svelte';
import InlineChoiceWidget from './widgets/InlineChoiceWidget.svelte';

export type WidgetComponent = Component<{
	item: QuestionnaireItem;
	answer?: QuestionnaireResponseItemAnswer;
	onChange: (answer: QuestionnaireResponseItemAnswer) => void;
	readonly?: boolean;
	error?: string;
}>;

export type WidgetRegistry = Record<string, WidgetComponent>;

export const defaultRegistry: WidgetRegistry = {
	string: StringWidget,
	text: MarkdownWidget,
	integer: IntegerWidget,
	decimal: DecimalWidget,
	date: DateWidget,
	dateTime: DateWidget,
	time: StringWidget,
	boolean: BooleanWidget,
	choice: ChoiceWidget,
	openChoice: ChoiceWidget,
	reference: ReferenceWidget,
	quantity: QuantityWidget,
	attachment: AttachmentWidget,
	phone: PhoneWidget,
	slider: SliderWidget,
	barcode: BarcodeWidget,
	'group-voice': GroupVoiceWidget,
	'group-tabs': GroupTabsWidget as unknown as WidgetComponent,
	'time-range-picker': TimeRangePickerWidget,
	'upload-file-control': UploadFileControlWidget,
	'inline-choice': InlineChoiceWidget
};

export function getWidget(
	registry: WidgetRegistry,
	item: QuestionnaireItem
): WidgetComponent | undefined {
	const itemControl = getItemControl(item);
	if (itemControl && registry[itemControl]) {
		return registry[itemControl];
	}
	if (item.type && registry[item.type]) {
		return registry[item.type];
	}
	return undefined;
}

export function getItemControl(item: QuestionnaireItem): string | undefined {
	const extension = item.extension?.find(
		(ext) =>
			ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' ||
			ext.url === 'https://beda.software/fhir/questionnaire-itemControl'
	);
	return extension?.valueCodeableConcept?.coding?.[0]?.code;
}

export function createDefaultWidgetRegistry(): WidgetRegistry {
	return { ...defaultRegistry };
}

export function mergeWidgetRegistry(
	base: WidgetRegistry,
	override: WidgetRegistry
): WidgetRegistry {
	return { ...base, ...override };
}
