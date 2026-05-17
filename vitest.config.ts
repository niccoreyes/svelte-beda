import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	resolve: {
		conditions: ['browser', 'default'],
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
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
