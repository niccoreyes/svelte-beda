<script lang="ts">
	interface Props {
		resource: any;
		resourceType: string;
		onEdit: (resource: any) => void;
	}

	let { resource, resourceType, onEdit }: Props = $props();

	const display = $derived(() => {
		const name =
			(resource.name as Array<{ given?: string[]; family?: string; text?: string }>)?.[0]?.text ||
			(resource.name as Array<{ given?: string[]; family?: string; text?: string }>)?.[0]?.family ||
			(resource.title as string) ||
			(resource.code?.text as string) ||
			(resource.code?.coding?.[0]?.display as string) ||
			(resource.identifier?.[0]?.value as string) ||
			(resource.id as string) ||
			'Unknown';
		return `${resourceType}/${resource.id || 'new'} — ${name}`;
	});
</script>

<div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
	<div class="flex items-center gap-3 min-w-0">
		<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
			<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		</div>
		<span class="text-sm text-gray-700 dark:text-gray-300 truncate">{display()}</span>
	</div>
	<button
		onclick={() => onEdit(resource)}
		class="flex-shrink-0 p-2 text-gray-500 hover:text-primary transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
		aria-label="Edit resource"
		title="Edit"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>
	</button>
</div>
