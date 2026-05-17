import type { Handle } from '@sveltejs/kit';
import { getAccessToken } from '$lib/auth/token';

export const handle: Handle = async ({ event, resolve }) => {
	const token = getAccessToken();
	event.locals.token = token;
	return resolve(event);
};
