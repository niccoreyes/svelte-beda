import { generateQuestionnaireFromText as aiGenerateQuestionnaireFromText } from './service';
import type { QuestionnaireGenerationResult } from './service';

export { type QuestionnaireGenerationResult };

export async function generateQuestionnaireFromText(prompt: string): Promise<QuestionnaireGenerationResult> {
	return aiGenerateQuestionnaireFromText(prompt);
}
