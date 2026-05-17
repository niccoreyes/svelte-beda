import { Role } from './role';
import { getCurrentUser } from './user';

export function selectCurrentUserRoleResource():
	| { resourceType: 'Patient'; id: string }
	| { resourceType: 'Practitioner'; id: string }
	| undefined {
	const user = getCurrentUser();
	if (!user?.role || !user.sub) return undefined;

	switch (user.role) {
		case Role.Patient:
			return { resourceType: 'Patient', id: user.sub };
		case Role.Practitioner:
		case Role.Admin:
			return { resourceType: 'Practitioner', id: user.sub };
		default:
			return undefined;
	}
}
