<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { initiateLogin } from '$lib/auth';

	let code = $state('');
	let error = $state<string | null>(null);

	$effect(() => {
		const url = new URL(window.location.href);
		const codeParam = url.searchParams.get('code');
		if (codeParam) {
			code = codeParam;
			import('$lib/auth/oauth').then(({ handleCallback }) => {
				handleCallback(code)
					.then(() => goto(resolve('/patients')))
					.catch((err: Error) => { error = err.message; });
			});
		}
	});

	function handleLogin() {
		initiateLogin();
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-50">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
		<div class="text-center mb-6">
			<h1 class="text-2xl font-bold text-gray-900">BEDA EMR</h1>
			<p class="text-sm text-gray-600 mt-1">Sign in to your account</p>
		</div>

		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
				{error}
			</div>
		{/if}

		{#if code}
			<div class="text-center">
				<div class="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary-600 rounded-full mb-2" role="status" aria-label="loading"></div>
				<p class="text-sm text-gray-600">Completing sign in...</p>
			</div>
		{:else}
			<button
				onclick={handleLogin}
				class="w-full py-2.5 px-4 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity font-medium"
			>
				Sign in with SSO
			</button>
			<p class="mt-4 text-xs text-center text-gray-500">
				Or continue with public access (no login required for demo)
			</p>
			<button
				onclick={() => goto(resolve('/patients'))}
				class="w-full mt-2 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
			>
				Continue as Guest
			</button>
		{/if}
	</div>
</div>
