<script lang="ts">
	import { resolve } from '$app/paths';
	let newPassword = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);
	let success = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}
		error = null;
		success = true;
	}
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-50">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
		<h1 class="text-xl font-bold text-gray-900 mb-2">Reset Password</h1>
		<p class="text-sm text-gray-600 mb-6">Enter your new password below.</p>

		{#if error}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
				Password reset successful. 			<a href={resolve('/signin')} class="underline">Sign in</a>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
					<input
						type="password"
						bind:value={newPassword}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						placeholder="Enter new password"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
					<input
						type="password"
						bind:value={confirmPassword}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
						placeholder="Confirm new password"
					/>
				</div>
				<button
					type="submit"
					class="w-full py-2.5 px-4 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity font-medium"
				>
					Reset Password
				</button>
			</form>
		{/if}
	</div>
</div>
