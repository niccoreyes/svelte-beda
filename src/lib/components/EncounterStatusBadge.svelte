<script lang="ts">
	interface Props {
		status: string;
	}

	let { status }: Props = $props();

	const statusClasses: Record<string, string> = {
		planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
		arrived: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
		'in-progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
		finished: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
		cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
		'entered-in-error': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
		completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
	};

	const statusLabels: Record<string, string> = {
		planned: 'Planned',
		arrived: 'Arrived',
		'in-progress': 'In Progress',
		finished: 'Finished',
		cancelled: 'Cancelled',
		'entered-in-error': 'Entered in Error',
		completed: 'Completed'
	};

	const classes = $derived(statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300');
	const label = $derived(statusLabels[status] || status);
</script>

<span
	class="badge {classes}"
>
	{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0 8px;
		height: 24px;
		font-size: 12px;
		font-weight: 500;
		border-radius: 4px;
		line-height: 22px;
		white-space: nowrap;
		border: 1px solid transparent;
	}
</style>
