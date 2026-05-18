import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: [
			'**/*.cjs',
			'**/node_modules/**',
			'**/dist/**',
			'**/.svelte-kit/**',
			'**/build/**',
			'**/.output/**',
			'**/coverage/**',
			'**/storybook-static/**'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	...svelte.configs['flat/prettier'],
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	}
];
