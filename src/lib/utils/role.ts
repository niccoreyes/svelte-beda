export enum Role {
	Patient = 'Patient',
	Practitioner = 'Practitioner',
	Receptionist = 'Receptionist',
	Admin = 'Admin'
}

export function selectUserRole(user: { role?: Array<{ name: string }> }, options: Record<string, unknown>): unknown {
	const roleName = user.role?.[0]?.name;
	return roleName ? options[roleName] : undefined;
}
