<script lang="ts">
	interface Props {
		title: string;
		status: string;
		url: string;
		onChange: (field: 'title' | 'status' | 'url', value: string) => void;
		onSave: () => void;
		onPublish?: () => void;
		saving?: boolean;
	}

	let { title, status, url, onChange, onSave, onPublish, saving = false }: Props = $props();
</script>

<div class="space-y-4">
	<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Questionnaire Details</h3>

	<div>
		<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
		<input
			type="text"
			value={title}
			oninput={(e) => onChange('title', e.currentTarget.value)}
			placeholder="Questionnaire title"
			class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
		/>
	</div>

	<div>
		<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
		<select
			value={status}
			onchange={(e) => onChange('status', e.currentTarget.value)}
			class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white bg-white"
		>
			<option value="draft">Draft</option>
			<option value="active">Active</option>
			<option value="retired">Retired</option>
			<option value="unknown">Unknown</option>
		</select>
	</div>

	<div>
		<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL</label>
		<input
			type="text"
			value={url}
			oninput={(e) => onChange('url', e.currentTarget.value)}
			placeholder="Canonical URL"
			class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
		/>
	</div>

	<div class="flex gap-2 pt-2">
		<button
			onclick={onSave}
			disabled={saving}
			class="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
		>
			{saving ? 'Saving...' : 'Save Draft'}
		</button>
		{#if onPublish}
			<button
				onclick={onPublish}
				disabled={saving}
				class="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
			>
				Publish
			</button>
		{/if}
	</div>
</div>
