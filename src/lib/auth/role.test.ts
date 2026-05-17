import { describe, it, expect } from 'vitest';
import { Role, isValidRole, getRoleDisplayName, getRolePermissions, hasPermission, canAccessResource } from './role';

describe('role system', () => {
	it('validates known roles', () => {
		expect(isValidRole('Patient')).toBe(true);
		expect(isValidRole('Practitioner')).toBe(true);
		expect(isValidRole('Admin')).toBe(true);
		expect(isValidRole('Receptionist')).toBe(true);
		expect(isValidRole('Unknown')).toBe(false);
	});

	it('returns display names', () => {
		expect(getRoleDisplayName(Role.Patient)).toBe('Patient');
		expect(getRoleDisplayName(Role.Practitioner)).toBe('Practitioner');
		expect(getRoleDisplayName(Role.Admin)).toBe('Administrator');
	});

	it('assigns permissions per role', () => {
		expect(getRolePermissions(Role.Patient)).toContain('read:patient');
		expect(getRolePermissions(Role.Practitioner)).toContain('create:patient');
		expect(getRolePermissions(Role.Admin)).toContain('*');
	});

	it('checks permission', () => {
		expect(hasPermission(Role.Patient, 'read:patient')).toBe(true);
		expect(hasPermission(Role.Patient, 'create:patient')).toBe(false);
		expect(hasPermission(Role.Admin, 'anything')).toBe(true);
	});

	it('checks resource access', () => {
		expect(canAccessResource(Role.Practitioner, 'create:encounter')).toBe(true);
		expect(canAccessResource(undefined, 'read:patient')).toBe(false);
	});
});
