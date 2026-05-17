import { describe, it, expect } from 'vitest';
import { defaultPatientDashboardConfig, validateConfig, type DashboardCardType } from './patientDashboardConfig';

describe('patientDashboardConfig', () => {
	it('returns default config with all card types', () => {
		const config = defaultPatientDashboardConfig();
		expect(config.cards).toHaveLength(9);
		expect(config.cards.map((c) => c.type)).toContain('general-info');
		expect(config.cards.map((c) => c.type)).toContain('appointments');
		expect(config.cards.map((c) => c.type)).toContain('summary');
	});

	it('validates correct config by returning it', () => {
		const config = defaultPatientDashboardConfig();
		const validated = validateConfig(config);
		expect(validated.cards).toHaveLength(9);
		expect(validated.cards[0]?.type).toBe('summary');
	});

	it('returns default config for invalid card type', () => {
		const config = { cards: [{ type: 'invalid-type' as DashboardCardType, title: 'Bad' }] };
		const validated = validateConfig(config);
		// Invalid cards are filtered out, so returns default
		expect(validated.cards.length).toBeGreaterThan(0);
	});

	it('returns default config for missing cards array', () => {
		const validated = validateConfig({});
		expect(validated.cards.length).toBeGreaterThan(0);
	});
});
