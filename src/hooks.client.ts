import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error }) => {
	console.error('Client error:', error);
	return {
		message: 'An unexpected error occurred',
		code: 'CLIENT_ERROR'
	};
};
