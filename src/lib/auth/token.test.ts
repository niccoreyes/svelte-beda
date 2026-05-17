import { describe, it, expect, beforeEach } from 'vitest';
import {
	getAccessToken,
	getRefreshToken,
	setTokens,
	removeTokens,
	isTokenExpired,
	getTokenExpiresAt
} from './token';

const mockStorage: Record<string, string> = {};

Object.defineProperty(globalThis, 'localStorage', {
	value: {
		getItem: (key: string) => mockStorage[key] ?? null,
		setItem: (key: string, value: string) => { mockStorage[key] = value; },
		removeItem: (key: string) => { delete mockStorage[key]; },
		clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); }
	},
	writable: true
});

describe('token management', () => {
	beforeEach(() => {
		(globalThis as any).localStorage.clear();
	});

	it('stores and retrieves access token', () => {
		setTokens('access123', 'refresh123', 3600);
		expect(getAccessToken()).toBe('access123');
		expect(getRefreshToken()).toBe('refresh123');
	});

	it('removes tokens', () => {
		setTokens('a', 'b', 100);
		removeTokens();
		expect(getAccessToken()).toBeNull();
		expect(getRefreshToken()).toBeNull();
	});

	it('detects expired token', () => {
		setTokens('a', 'b', -1);
		expect(isTokenExpired()).toBe(true);
	});

	it('detects valid token', () => {
		setTokens('a', 'b', 3600);
		expect(isTokenExpired()).toBe(false);
	});

	it('returns expires at timestamp', () => {
		const before = Date.now();
		setTokens('a', 'b', 3600);
		const after = Date.now();
		const expiresAt = getTokenExpiresAt()!;
		expect(expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000 - 100);
		expect(expiresAt).toBeLessThanOrEqual(after + 3600 * 1000 + 100);
	});
});
