import type { User } from '$lib/auth/user';

export function generateJitsiJWT(roomName: string, user: User): string {
	const header = { alg: 'none', typ: 'JWT' };
	const payload = {
		iss: 'beda-emr',
		sub: user.sub || 'anonymous',
		aud: 'jitsi',
		exp: Math.floor(Date.now() / 1000) + 3600,
		iat: Math.floor(Date.now() / 1000),
		room: roomName,
		context: {
			user: {
				name: user.name || 'Unknown',
				email: user.email || '',
				id: user.sub || 'anonymous'
			}
		}
	};
	const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=/g, '');
	return `${encode(header)}.${encode(payload)}.`;
}

export function getJitsiUrl(roomName: string, jwt?: string): string {
	const base = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
	const params = new URLSearchParams();
	params.append('config.requireDisplayName', 'true');
	params.append('config.startWithAudioMuted', 'false');
	params.append('config.startWithVideoMuted', 'false');
	params.append('interfaceConfig.SHOW_JITSI_WATERMARK', 'false');
	params.append('interfaceConfig.SHOW_BRAND_WATERMARK', 'false');
	if (jwt) {
		params.append('jwt', jwt);
	}
	return `${base}#${params.toString()}`;
}
