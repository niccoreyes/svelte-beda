import { describe, it, expect } from 'vitest';
import { Role } from '../auth/role';
import { matchCurrentUserRole } from '../auth/permissions';

describe('batch action selection logic', () => {
	it('allows finish encounter for Practitioner', () => {
		expect(matchCurrentUserRole(Role.Practitioner, Role.Practitioner, Role.Admin)).toBe(true);
	});

	it('allows finish encounter for Admin', () => {
		expect(matchCurrentUserRole(Role.Admin, Role.Practitioner, Role.Admin)).toBe(true);
	});

	it('denies finish encounter for Patient', () => {
		expect(matchCurrentUserRole(Role.Patient, Role.Practitioner, Role.Admin)).toBe(false);
	});

	it('denies finish encounter for Receptionist', () => {
		expect(matchCurrentUserRole(Role.Receptionist, Role.Practitioner, Role.Admin)).toBe(false);
	});

	it('allows delete for Admin only', () => {
		expect(matchCurrentUserRole(Role.Admin, Role.Admin)).toBe(true);
		expect(matchCurrentUserRole(Role.Practitioner, Role.Admin)).toBe(false);
	});
});
