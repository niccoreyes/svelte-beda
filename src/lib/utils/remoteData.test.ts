import { describe, it, expect } from 'vitest';
import { notAsked, loading, success, failure, isSuccess, isFailure, isLoading, isNotAsked, mapSuccess } from './remoteData';

describe('RemoteData utilities', () => {
	it('isSuccess returns true only for success', () => {
		expect(isSuccess(success(42))).toBe(true);
		expect(isSuccess(failure(new Error('x')))).toBe(false);
		expect(isSuccess(loading())).toBe(false);
		expect(isSuccess(notAsked())).toBe(false);
	});

	it('isFailure returns true only for failure', () => {
		expect(isFailure(failure(new Error('x')))).toBe(true);
		expect(isFailure(success(42))).toBe(false);
	});

	it('isLoading returns true only for loading', () => {
		expect(isLoading(loading())).toBe(true);
		expect(isLoading(success(42))).toBe(false);
	});

	it('isNotAsked returns true only for notAsked', () => {
		expect(isNotAsked(notAsked())).toBe(true);
		expect(isNotAsked(loading())).toBe(false);
	});

	it('mapSuccess transforms data', () => {
		const rd = success<number, Error>(5);
		const mapped = mapSuccess(rd, (n: number) => n * 2);
		expect(isSuccess(mapped) && mapped.data).toBe(10);
	});

	it('mapSuccess preserves non-success states', () => {
		expect(mapSuccess(loading<number, Error>(), (n: number) => n * 2).status).toBe('loading');
		expect(mapSuccess(failure<number, Error>(new Error('x')), (n: number) => n * 2).status).toBe('failure');
		expect(mapSuccess(notAsked<number, Error>(), (n: number) => n * 2).status).toBe('notAsked');
	});
});
