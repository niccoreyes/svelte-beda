import { describe, it, expect } from 'vitest';
import { getFormDataDiff } from './diff';

describe('diff utility', () => {
	it('identifies added lines', () => {
		const oldText = 'line1\nline2';
		const newText = 'line1\nline2\nline3';
		const diff = getFormDataDiff(oldText, newText);
		expect(diff.additions).toContain('line3');
	});

	it('identifies removed and added lines', () => {
		const oldText = 'line1\nline2\nline3';
		const newText = 'line1\nline3';
		const diff = getFormDataDiff(oldText, newText);
		// line2 was at index 1 in old, at index 1 in new it's 'line3'
		expect(diff.deletions).toContain('line2');
		expect(diff.additions).toContain('line3');
	});

	it('identifies changed lines', () => {
		const oldText = 'a\nb\nc';
		const newText = 'a\nx\nc';
		const diff = getFormDataDiff(oldText, newText);
		expect(diff.additions).toContain('x');
		expect(diff.deletions).toContain('b');
	});

	it('handles new text with empty old', () => {
		const diff = getFormDataDiff('', 'new line');
		expect(diff.additions).toContain('new line');
	});
});
