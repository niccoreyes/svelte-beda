<script lang="ts">
	import { getFormDataDiff } from '$lib/utils/diff';

	interface Props {
		oldText: string;
		newText: string;
		mode?: 'inline' | 'sideBySide';
	}

	let { oldText, newText, mode = 'inline' }: Props = $props();

	const diffResult = $derived(() => getFormDataDiff(oldText, newText));

	const inlineDiff = $derived(() => {
		const result: Array<{ type: 'same' | 'removed' | 'added'; line: string }> = [];
		const oldLines = oldText.split('\n');
		const newLines = newText.split('\n');
		for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
			const oldLine = oldLines[i];
			const newLine = newLines[i];
			if (oldLine === newLine) {
				result.push({ type: 'same', line: oldLine || '' });
			} else {
				if (oldLine !== undefined) result.push({ type: 'removed', line: oldLine });
				if (newLine !== undefined) result.push({ type: 'added', line: newLine });
			}
		}
		return result;
	});
</script>

{#if mode === 'sideBySide'}
	{@const { additions, deletions } = diffResult()}
	<div class="grid grid-cols-2 gap-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
		<div>
			<div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
				Old
			</div>
			<table class="w-full text-sm font-mono">
				<tbody>
					{#each oldText.split('\n') as line}
						{@const isRemoved = deletions.includes(line)}
						<tr class={isRemoved ? 'bg-red-50 dark:bg-red-900/20' : ''}>
							<td class="px-3 py-1 w-6 select-none text-gray-400 border-r border-gray-100 dark:border-gray-700">
								{isRemoved ? '-' : ' '}
							</td>
							<td class="px-3 py-1 whitespace-pre {isRemoved ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">
								{line}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div>
			<div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
				New
			</div>
			<table class="w-full text-sm font-mono">
				<tbody>
					{#each newText.split('\n') as line}
						{@const isAdded = additions.includes(line)}
						<tr class={isAdded ? 'bg-green-50 dark:bg-green-900/20' : ''}>
							<td class="px-3 py-1 w-6 select-none text-gray-400 border-r border-gray-100 dark:border-gray-700">
								{isAdded ? '+' : ' '}
							</td>
							<td class="px-3 py-1 whitespace-pre {isAdded ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}">
								{line}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
		<table class="w-full text-sm font-mono">
			<tbody>
				{#each inlineDiff() as item}
					<tr class={
						item.type === 'removed'
							? 'bg-red-50 dark:bg-red-900/20'
							: item.type === 'added'
								? 'bg-green-50 dark:bg-green-900/20'
								: ''
					}>
						<td class="px-3 py-1 w-6 select-none text-gray-400 border-r border-gray-100 dark:border-gray-700">
							{item.type === 'removed' ? '-' : item.type === 'added' ? '+' : ' '}
						</td>
						<td class="px-3 py-1 whitespace-pre">
							<span class={
								item.type === 'removed'
									? 'text-red-700 dark:text-red-400'
									: item.type === 'added'
										? 'text-green-700 dark:text-green-400'
										: 'text-gray-700 dark:text-gray-300'
							}>
								{item.line}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
