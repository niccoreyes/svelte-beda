import { describe, it, expect } from 'vitest';
import { Role, matchCurrentUserRole, requirePermission } from './permissions';

describe('permissions', () => {
	it('matches current user role against allowed roles', () => {
		expect(matchCurrentUserRole(Role.Practitioner, Role.Practitioner, Role.Admin)).toBe(true);
		expect(matchCurrentUserRole(Role.Patient, Role.Practitioner, Role.Admin)).toBe(false);
		expect(matchCurrentUserRole(undefined, Role.Admin)).toBe(false);
	});

	it('requires specific permission', () => {
		expect(requirePermission(Role.Practitioner, 'create:patient')).toBe(true);
		expect(requirePermission(Role.Patient, 'create:patient')).toBe(false);
		expect(requirePermission(undefined, 'read:patient')).toBe(false);
	});
});
