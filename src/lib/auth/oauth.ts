import { goto } from '$app/navigation';
import { setTokens, removeTokens } from './token';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'https://auth.fhirlab.net';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'beda-emr';
const REDIRECT_URI = typeof window !== 'undefined'
	? `${window.location.origin}/signin`
	: 'http://localhost:5173/signin';

function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
	const verifier = crypto.getRandomValues(new Uint8Array(32))
		.reduce((acc, val) => acc + val.toString(36).padStart(2, '0'), '');
	const challenge = btoa(verifier)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
	return { codeVerifier: verifier, codeChallenge: challenge };
}

export async function initiateLogin(): Promise<void> {
	const { codeVerifier, codeChallenge } = generatePKCE();
	localStorage.setItem('beda_pkce_verifier', codeVerifier);

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
		scope: 'openid profile email'
	});

	window.location.href = `${AUTH_BASE_URL}/auth?${params.toString()}`;
}

export async function handleCallback(code: string): Promise<void> {
	const codeVerifier = localStorage.getItem('beda_pkce_verifier');
	if (!codeVerifier) {
		throw new Error('PKCE verifier not found');
	}

	const response = await fetch(`${AUTH_BASE_URL}/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			code,
			redirect_uri: REDIRECT_URI,
			code_verifier: codeVerifier
		})
	});

	if (!response.ok) {
		throw new Error(`Token exchange failed: ${response.status}`);
	}

	const data = await response.json();
	setTokens(data.access_token, data.refresh_token, data.expires_in);
	localStorage.removeItem('beda_pkce_verifier');
	goto('/patients');
}

export async function refreshAccessToken(): Promise<string | null> {
	const { getRefreshToken } = await import('./token');
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;

	const response = await fetch(`${AUTH_BASE_URL}/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: CLIENT_ID,
			refresh_token: refreshToken
		})
	});

	if (!response.ok) {
		removeTokens();
		return null;
	}

	const data = await response.json();
	setTokens(data.access_token, data.refresh_token, data.expires_in);
	return data.access_token;
}

export function logout(): void {
	removeTokens();
	goto('/signin');
}
