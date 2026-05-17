<script lang="ts">
	interface Props {
		status: string;
	}

	let { status }: Props = $props();

	const statusConfig: Record<string, { label: string; bg: string; text: string; border?: string }> = {
		planned: { label: 'Planned', bg: 'var(--bcp-1)', text: 'var(--bcp-8)' },
		arrived: { label: 'Arrived', bg: 'var(--wp-1)', text: 'var(--wp-8)' },
		'in-progress': { label: 'In Progress', bg: 'var(--bcs-1)', text: 'var(--bcs-8)' },
		finished: { label: 'Finished', bg: 'var(--gray-2)', text: 'var(--gray-9)' },
		cancelled: { label: 'Cancelled', bg: 'var(--ep-1)', text: 'var(--ep-8)' },
		completed: { label: 'Completed', bg: 'var(--bcp-1)', text: 'var(--bcp-8)' }
	};

	const config = $derived(statusConfig[status] || { label: status, bg: 'var(--gray-2)', text: 'var(--gray-9)' });
</script>

<span
	class="badge"
	style:background-color={config.bg}
	style:color={config.text}
>
	{config.label}
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
