export enum Role {
	Patient = 'Patient',
	Practitioner = 'Practitioner',
	Receptionist = 'Receptionist',
	Admin = 'Admin'
}

export const ALL_ROLES = [Role.Patient, Role.Practitioner, Role.Receptionist, Role.Admin];

export function isValidRole(role: string): role is Role {
	return ALL_ROLES.includes(role as Role);
}

export function getRoleDisplayName(role: Role): string {
	switch (role) {
		case Role.Patient:
			return 'Patient';
		case Role.Practitioner:
			return 'Practitioner';
		case Role.Receptionist:
			return 'Receptionist';
		case Role.Admin:
			return 'Administrator';
	}
}

export function getRolePermissions(role: Role): string[] {
	switch (role) {
		case Role.Patient:
			return ['read:patient', 'read:appointment', 'read:document'];
		case Role.Practitioner:
			return [
				'create:patient',
				'update:patient',
				'read:patient',
				'create:encounter',
				'update:encounter',
				'read:encounter',
				'create:document',
				'update:document',
				'read:document',
				'create:prescription',
				'read:prescription',
				'create:appointment',
				'update:appointment',
				'read:appointment'
			];
		case Role.Receptionist:
			return [
				'create:patient',
				'update:patient',
				'read:patient',
				'create:appointment',
				'update:appointment',
				'read:appointment',
				'read:encounter',
				'create:invoice',
				'read:invoice'
			];
		case Role.Admin:
			return ['*'];
	}
}

export function hasPermission(role: Role, permission: string): boolean {
	const permissions = getRolePermissions(role);
	return permissions.includes('*') || permissions.includes(permission);
}

export function canAccessResource(role: Role | undefined, requiredPermission: string): boolean {
	if (!role) return false;
	return hasPermission(role, requiredPermission);
}
