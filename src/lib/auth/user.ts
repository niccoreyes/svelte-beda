import { getAccessToken } from './token';

export interface User {
	sub: string;
	name?: string;
	email?: string;
	role?: string;
	picture?: string;
}

export function getCurrentUser(): User | null {
	const token = getAccessToken();
	if (!token) return null;
	try {
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const payload = JSON.parse(atob(parts[1]!));
		return {
			sub: payload.sub,
			name: payload.name,
			email: payload.email,
			role: payload.role,
			picture: payload.picture
		};
	} catch {
		return null;
	}
}

export function isAuthenticated(): boolean {
	return !!getAccessToken();
}
