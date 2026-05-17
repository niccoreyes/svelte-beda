import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: 'var(--theme-primary)',
				secondary: 'var(--theme-secondary)',
				error: 'var(--theme-error)',
				warning: 'var(--theme-warning)',
				'bcp-1': 'var(--bcp-1)',
				'bcp-2': 'var(--bcp-2)',
				'bcp-3': 'var(--bcp-3)',
				'bcp-4': 'var(--bcp-4)',
				'bcp-5': 'var(--bcp-5)',
				'bcp-6': 'var(--bcp-6)',
				'bcp-7': 'var(--bcp-7)',
				'bcp-8': 'var(--bcp-8)',
				'bcp-9': 'var(--bcp-9)',
				'bcp-10': 'var(--bcp-10)',
				'bcs-1': 'var(--bcs-1)',
				'bcs-2': 'var(--bcs-2)',
				'bcs-3': 'var(--bcs-3)',
				'bcs-4': 'var(--bcs-4)',
				'bcs-5': 'var(--bcs-5)',
				'bcs-6': 'var(--bcs-6)',
				'bcs-7': 'var(--bcs-7)',
				'bcs-8': 'var(--bcs-8)',
				'bcs-9': 'var(--bcs-9)',
				'bcs-10': 'var(--bcs-10)',
				'ep-1': 'var(--ep-1)',
				'wp-1': 'var(--wp-1)',
				'gray-1': 'var(--gray-1)',
				'gray-13': 'var(--gray-13)'
			}
		}
	},
	plugins: []
} satisfies Config;
