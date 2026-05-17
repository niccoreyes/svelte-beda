import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	resolve: {
		conditions: ['browser', 'default']
	},
	ssr: {
		noExternal: ['@testing-library/svelte', 'svelte']
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/setupTests.ts', '@testing-library/svelte/vitest'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
