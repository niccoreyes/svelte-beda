import { generateQuestionnaireFromPDF as aiGenerateQuestionnaireFromPDF } from './service';
import type { QuestionnaireGenerationResult } from './service';

export { type QuestionnaireGenerationResult };

export async function generateQuestionnaireFromPDF(file: File): Promise<QuestionnaireGenerationResult> {
	return aiGenerateQuestionnaireFromPDF(file);
}
