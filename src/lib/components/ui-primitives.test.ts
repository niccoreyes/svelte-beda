import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AlertMessage from './AlertMessage.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import Tabs from './Tabs.svelte';
import Wizard from './Wizard.svelte';

describe('AlertMessage', () => {
	it('renders info alert', () => {
		render(AlertMessage, { props: { type: 'info', message: 'Hello' } });
		expect(screen.getByText('Hello')).toBeTruthy();
	});

	it('dismisses on click', async () => {
		render(AlertMessage, { props: { type: 'info', message: 'Dismiss me', dismissible: true } });
		const btn = screen.getByRole('button');
		await fireEvent.click(btn);
		expect(screen.queryByText('Dismiss me')).toBeFalsy();
	});
});

describe('Breadcrumbs', () => {
	it('renders crumbs', () => {
		render(Breadcrumbs, {
			props: {
				crumbs: [
					{ label: 'Home', href: '/' },
					{ label: 'Patients', href: '/patients' }
				]
			}
		});
		expect(screen.getByText('Home')).toBeTruthy();
		expect(screen.getByText('Patients')).toBeTruthy();
	});
});

describe('Tabs', () => {
	it('renders tabs', async () => {
		render(Tabs, {
			props: {
				tabs: [
					{ id: 'a', label: 'Tab A' },
					{ id: 'b', label: 'Tab B' }
				],
				activeTab: 'a'
			}
		});
		expect(screen.getByText('Tab A')).toBeTruthy();
		expect(screen.getByText('Tab B')).toBeTruthy();
	});
});

describe('Wizard', () => {
	it('renders wizard with steps', () => {
		render(Wizard, {
			props: {
				steps: [
					{ title: 'Step 1' },
					{ title: 'Step 2' }
				]
			}
		});
		expect(screen.getByText('Step 1')).toBeTruthy();
	});
});
