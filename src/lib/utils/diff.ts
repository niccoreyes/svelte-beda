export interface DiffResult {
	additions: string[];
	deletions: string[];
}

export function getFormDataDiff(oldText: string, newText: string): DiffResult {
	const oldLines = oldText.split('\n');
	const newLines = newText.split('\n');
	const additions: string[] = [];
	const deletions: string[] = [];

	const maxLen = Math.max(oldLines.length, newLines.length);
	for (let i = 0; i < maxLen; i++) {
		const oldLine = oldLines[i];
		const newLine = newLines[i];
		if (oldLine !== newLine) {
			if (oldLine !== undefined) deletions.push(oldLine);
			if (newLine !== undefined) additions.push(newLine);
		}
	}

	return { additions, deletions };
}
