export interface MagicSearchResult {
	resourceType: string;
	searchParams: Record<string, string | string[]>;
	explanation: string;
}

const KEYWORD_MAP: Array<{
	keywords: string[];
	resourceType: string;
	searchParam: string;
	valueTransform?: (match: string) => string;
	explanation: string;
}> = [
	{
		keywords: ['patient', 'patients'],
		resourceType: 'Patient',
		searchParam: 'name',
		explanation: 'Searching for patients by name'
	},
	{
		keywords: ['appointment', 'appointments'],
		resourceType: 'Appointment',
		searchParam: 'date',
		explanation: 'Searching for appointments by date'
	},
	{
		keywords: ['encounter', 'encounters'],
		resourceType: 'Encounter',
		searchParam: 'subject',
		explanation: 'Searching for encounters by patient'
	},
	{
		keywords: ['condition', 'conditions', 'diagnosis', 'diagnoses'],
		resourceType: 'Condition',
		searchParam: 'code:text',
		explanation: 'Searching for conditions by description'
	},
	{
		keywords: ['medication', 'medications', 'meds', 'drug', 'drugs'],
		resourceType: 'MedicationRequest',
		searchParam: 'medication',
		explanation: 'Searching for medication requests'
	},
	{
		keywords: ['observation', 'observations', 'lab', 'labs', 'vitals'],
		resourceType: 'Observation',
		searchParam: 'code:text',
		explanation: 'Searching for observations or lab results'
	},
	{
		keywords: ['practitioner', 'practitioners', 'doctor', 'doctors', 'provider', 'providers'],
		resourceType: 'Practitioner',
		searchParam: 'name',
		explanation: 'Searching for practitioners by name'
	},
	{
		keywords: ['invoice', 'invoices', 'bill', 'billing'],
		resourceType: 'Invoice',
		searchParam: 'subject',
		explanation: 'Searching for invoices by patient'
	},
	{
		keywords: ['questionnaire', 'questionnaires', 'form', 'forms'],
		resourceType: 'Questionnaire',
		searchParam: 'title',
		explanation: 'Searching for questionnaires by title'
	},
	{
		keywords: ['document', 'documents', 'documentreference', 'document reference'],
		resourceType: 'DocumentReference',
		searchParam: 'description',
		explanation: 'Searching for documents by description'
	},
	{
		keywords: ['allergy', 'allergies', 'intolerance'],
		resourceType: 'AllergyIntolerance',
		searchParam: 'code:text',
		explanation: 'Searching for allergies and intolerances'
	},
	{
		keywords: ['procedure', 'procedures', 'surgery', 'surgeries'],
		resourceType: 'Procedure',
		searchParam: 'code:text',
		explanation: 'Searching for procedures'
	}
];

const TODAY_KEYWORDS = ['today', 'now', 'current'];
const PENDING_KEYWORDS = ['pending', 'upcoming', 'scheduled', 'active', 'open'];
const COMPLETED_KEYWORDS = ['completed', 'done', 'past', 'closed', 'finished'];

function getTodayRange(): { start: string; end: string } {
	const start = new Date().toISOString().slice(0, 10);
	return { start, end: start };
}

function extractQuotedText(query: string): string | undefined {
	const match = query.match(/"([^"]+)"/);
	return match ? match[1] : undefined;
}

function extractPatientId(query: string): string | undefined {
	const match = query.match(/patient\s+(\d+|\w+[-]?\w+)/i);
	return match ? match[1] : undefined;
}

function extractNameOrTerm(query: string): string {
	const quoted = extractQuotedText(query);
	if (quoted) return quoted;

	// Remove common stop words and resource keywords
	let cleaned = query.toLowerCase();
	const stopWords = [
		'the', 'a', 'an', 'for', 'with', 'by', 'in', 'on', 'at', 'to', 'of',
		'find', 'search', 'show', 'get', 'list', 'all', 'my', 'me',
		'who', 'what', 'where', 'when', 'how',
		'has', 'have', 'had', 'is', 'are', 'was', 'were',
		'diagnosed', 'suffering', 'history',
		'patient', 'patients',
		'appointment', 'appointments',
		'encounter', 'encounters',
		'condition', 'conditions', 'diagnosis', 'diagnoses',
		'medication', 'medications', 'meds',
		'observation', 'observations', 'lab', 'labs', 'vitals',
		'practitioner', 'practitioners', 'doctor', 'doctors',
		'invoice', 'invoices', 'bill', 'billing',
		'questionnaire', 'questionnaires', 'form', 'forms',
		'document', 'documents',
		'allergy', 'allergies', 'intolerance',
		'procedure', 'procedures', 'surgery', 'surgeries',
		'today', 'now', 'current',
		'pending', 'upcoming', 'scheduled', 'active', 'open',
		'completed', 'done', 'past', 'closed', 'finished'
	];

	for (const word of stopWords) {
		cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
	}
	return cleaned.trim();
}

export function magicSearch(query: string): MagicSearchResult {
	const lowerQuery = query.toLowerCase().trim();

	// Find matching resource type
	let matchedResource: (typeof KEYWORD_MAP)[number] = KEYWORD_MAP[0]!; // default to Patient
	for (const entry of KEYWORD_MAP) {
		for (const keyword of entry.keywords) {
			if (lowerQuery.includes(keyword)) {
				matchedResource = entry;
				break;
			}
		}
		if (matchedResource !== KEYWORD_MAP[0]) break;
	}

	const searchParams: Record<string, string | string[]> = {};
	let explanation = matchedResource.explanation;

	// Check for "today"
	const isToday = TODAY_KEYWORDS.some((k) => lowerQuery.includes(k));
	if (isToday && matchedResource.resourceType === 'Appointment') {
		const { start, end } = getTodayRange();
		searchParams['date'] = [`ge${start}`, `le${end}`];
		explanation = 'Searching for appointments scheduled today';
	}

	// Check for status keywords
	const isPending = PENDING_KEYWORDS.some((k) => lowerQuery.includes(k));
	const isCompleted = COMPLETED_KEYWORDS.some((k) => lowerQuery.includes(k));
	if (isPending) {
		searchParams['status'] = 'booked,arrived,checked-in,planned';
		explanation += ' with pending/active status';
	} else if (isCompleted) {
		searchParams['status'] = 'fulfilled,completed,arrived';
		explanation += ' with completed status';
	}

	// Check for patient reference
	const patientId = extractPatientId(query);
	if (patientId) {
		searchParams['patient'] = patientId;
		explanation += ` for patient ${patientId}`;
	} else if (
		matchedResource.resourceType !== 'Patient' &&
		matchedResource.resourceType !== 'Practitioner' &&
		matchedResource.resourceType !== 'Questionnaire'
	) {
		const patientRef = extractPatientId(query) || lowerQuery.match(/for\s+(?:patient\s+)?(\S+)/i)?.[1];
		if (patientRef) {
			searchParams['patient'] = patientRef;
			explanation += ` for patient ${patientRef}`;
		}
	}

	// Extract search term
	const term = extractNameOrTerm(query);
	if (term) {
		if (matchedResource.resourceType === 'Patient' || matchedResource.resourceType === 'Practitioner') {
			searchParams['name'] = term;
		} else if (matchedResource.resourceType === 'Appointment') {
			searchParams['patient.name'] = term;
		} else if (matchedResource.resourceType === 'Condition') {
			searchParams['code:text'] = term;
			explanation = `Searching for conditions related to "${term}"`;
		} else if (matchedResource.resourceType === 'MedicationRequest') {
			searchParams['medication'] = term;
			explanation = `Searching for medication requests containing "${term}"`;
		} else if (matchedResource.resourceType === 'Observation') {
			searchParams['code:text'] = term;
			explanation = `Searching for observations or labs related to "${term}"`;
		} else {
			searchParams[matchedResource.searchParam] = term;
		}
	}

	// Special case: "diabetes" → Condition search
	if (lowerQuery.includes('diabetes') || lowerQuery.includes('diabetic')) {
		matchedResource = KEYWORD_MAP.find((k) => k.resourceType === 'Condition') || matchedResource;
		searchParams['code:text'] = 'diabetes';
		explanation = 'Searching for patients with diabetes-related conditions';
	}

	// Special case: "hypertension" / "high blood pressure"
	if (lowerQuery.includes('hypertension') || lowerQuery.includes('high blood pressure')) {
		matchedResource = KEYWORD_MAP.find((k) => k.resourceType === 'Condition') || matchedResource;
		searchParams['code:text'] = 'hypertension';
		explanation = 'Searching for patients with hypertension';
	}

	// Special case: "patients with X" → search conditions then can be cross-referenced
	if (
		lowerQuery.includes('patients with') ||
		lowerQuery.includes('patients diagnosed') ||
		lowerQuery.includes('patients having')
	) {
		if (matchedResource.resourceType === 'Condition') {
			// Keep Condition search; UI can show associated patients
			explanation = `Finding conditions to identify patients with "${term || 'specified condition'}"`;
		}
	}

	return {
		resourceType: matchedResource.resourceType,
		searchParams,
		explanation
	};
}
