import { Role, getRolePermissions, hasPermission } from './role';

export type Permission =
	| 'create:patient'
	| 'update:patient'
	| 'read:patient'
	| 'delete:patient'
	| 'create:encounter'
	| 'update:encounter'
	| 'read:encounter'
	| 'create:document'
	| 'update:document'
	| 'read:document'
	| 'create:prescription'
	| 'read:prescription'
	| 'create:appointment'
	| 'update:appointment'
	| 'read:appointment'
	| 'create:invoice'
	| 'read:invoice'
	| 'create:practitioner'
	| 'read:practitioner'
	| 'read:medication'
	| 'admin'
	| '*';

export { Role, getRolePermissions, hasPermission };

export function matchCurrentUserRole(
	currentRole: Role | undefined,
	...allowedRoles: Role[]
): boolean {
	if (!currentRole) return false;
	return allowedRoles.includes(currentRole);
}

export function requirePermission(
	currentRole: Role | undefined,
	permission: Permission
): boolean {
	if (!currentRole) return false;
	return hasPermission(currentRole, permission);
}
