import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/lib/index.ts'),
				components: resolve(__dirname, 'src/lib/components/index.ts'),
				fhir: resolve(__dirname, 'src/lib/fhir/index.ts'),
				forms: resolve(__dirname, 'src/lib/forms/index.ts'),
				state: resolve(__dirname, 'src/lib/state/index.ts'),
				ai: resolve(__dirname, 'src/lib/ai/index.ts'),
				auth: resolve(__dirname, 'src/lib/auth/index.ts'),
				utils: resolve(__dirname, 'src/lib/utils/index.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			external: [
				'svelte',
				'svelte/animate',
				'svelte/easing',
				'svelte/internal',
				'svelte/internal/client',
				'svelte/motion',
				'svelte/store',
				'svelte/transition',
				'sveltekit-i18n',
				'@sveltejs/kit',
				'$app/*',
				'$lib/*'
			]
		}
	},
	plugins: [svelte()]
});
