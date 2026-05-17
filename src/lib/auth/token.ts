const ACCESS_TOKEN_KEY = 'beda_access_token';
const REFRESH_TOKEN_KEY = 'beda_refresh_token';
const TOKEN_EXPIRES_KEY = 'beda_token_expires';

export function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
	const expiresAt = Date.now() + expiresIn * 1000;
	localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
}

export function removeTokens(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem(TOKEN_EXPIRES_KEY);
}

export function isTokenExpired(): boolean {
	if (typeof window === 'undefined') return true;
	const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
	if (!expiresAt) return true;
	return Date.now() >= Number(expiresAt);
}

export function getTokenExpiresAt(): number | null {
	if (typeof window === 'undefined') return null;
	const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY);
	return expiresAt ? Number(expiresAt) : null;
}
