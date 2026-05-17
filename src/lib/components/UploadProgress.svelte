<script lang="ts">
	interface Props {
		progress: number;
		filename?: string;
		status?: 'uploading' | 'complete' | 'error';
	}

	let { progress, filename, status = 'uploading' }: Props = $props();

	let pct = $derived(Math.min(100, Math.max(0, Math.round(progress))));
</script>

<div class="upload-progress">
	{#if filename}
		<div class="file-info">
			<svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
			</svg>
			<span class="file-name text-sm truncate">{filename}</span>
		</div>
	{/if}
	<div class="progress-row">
		<div class="progress-track">
			<div
				class="progress-fill"
				class:complete={status === 'complete'}
				class:error={status === 'error'}
				style="width: {pct}%"
			></div>
		</div>
		<span class="progress-label text-xs">{pct}%</span>
	</div>
	{#if status === 'complete'}
		<p class="status-text text-xs text-green-600 dark:text-green-400">Upload complete</p>
	{:else if status === 'error'}
		<p class="status-text text-xs text-red-600 dark:text-red-400">Upload failed</p>
	{:else}
		<p class="status-text text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
	{/if}
</div>

<style>
	.upload-progress {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.file-info {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.file-name {
		color: var(--gray-8);
	}

	.progress-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.progress-track {
		flex: 1;
		height: 6px;
		background-color: var(--gray-4);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--bcp-6);
		transition: width 0.2s ease;
		border-radius: 3px;
	}

	.progress-fill.complete {
		background-color: #22c55e;
	}

	.progress-fill.error {
		background-color: #ef4444;
	}

	.progress-label {
		color: var(--gray-7);
		font-variant-numeric: tabular-nums;
		min-width: 2.5em;
		text-align: right;
	}

	.status-text {
		margin: 0;
	}
</style>
