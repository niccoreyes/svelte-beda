export const config = {
	fhirBaseURL: import.meta.env.VITE_FHIR_BASE_URL || 'https://cdr.fhirlab.net/fhir',
	terminologyServer: import.meta.env.VITE_TERMINOLOGY_SERVER || null,
	aiAssistantServiceUrl: import.meta.env.VITE_AI_ASSISTANT_URL || null,
	jitsiMeetServer: import.meta.env.VITE_JITSI_SERVER || null,
	defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'en'
};
