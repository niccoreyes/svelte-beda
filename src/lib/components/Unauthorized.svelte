<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh] p-8">
	<div class="text-6xl mb-4">🔒</div>
	<h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
	<p class="text-gray-600 mb-6 text-center max-w-md">
		You don't have permission to access this page. Please contact your administrator if you believe this is an error.
	</p>
	<button
		onclick={() => goto('/patients')}
		class="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity"
	>
		Go to Patients
	</button>
</div>
