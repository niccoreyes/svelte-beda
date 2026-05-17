import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Spinner from './Spinner.svelte';

describe('Spinner', () => {
	it('renders and unmounts without errors', () => {
		const { container, unmount } = render(Spinner);
		expect(container.querySelector('.animate-spin')).toBeTruthy();
		unmount();
		expect(container.innerHTML).toBe('');
	});
});
