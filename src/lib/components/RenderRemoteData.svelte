<script lang="ts">
	import type { RemoteData } from '$lib/state';
	import { isLoading, isFailure, isSuccess } from '$lib/state';

	interface Props {
		remoteData: RemoteData<unknown, Error>;
		renderLoading?: import('svelte').Snippet;
		renderFailure?: import('svelte').Snippet<[Error]>;
		children?: import('svelte').Snippet<[unknown]>;
	}

	let { remoteData, renderLoading, renderFailure, children }: Props = $props();
</script>

{#if isLoading(remoteData)}
	{#if renderLoading}
		{@render renderLoading()}
	{:else}
		<div class="flex items-center justify-center p-4">
			<div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
		</div>
	{/if}
{:else if isFailure(remoteData)}
	{#if renderFailure}
		{@render renderFailure(remoteData.error)}
	{:else}
		<div class="p-4 text-error">
			<p>Error: {remoteData.error?.message || 'Unknown error'}</p>
		</div>
	{/if}
{:else if isSuccess(remoteData)}
	{#if children}
		{@render children(remoteData.data)}
	{/if}
{/if}
