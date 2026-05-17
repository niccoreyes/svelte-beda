<script lang="ts">
	import { PageContainer, Empty } from '$lib/components';
	import {
		getNotifications,
		markRead,
		markAllRead,
		removeNotification,
		unreadCount,
		clearAllNotifications
	} from '$lib/state/notifications.svelte';

	let filter = $state<'all' | 'unread'>('all');
	let notifications = $derived(getNotifications());
	let count = $derived(unreadCount());

	let filtered = $derived(
		filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
	);

	function formatTime(ts: number): string {
		return new Intl.DateTimeFormat(undefined, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(ts));
	}

	const typeStyles: Record<string, string> = {
		info: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
		success: 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10',
		warning: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10',
		error: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
	};

	const typeLabels: Record<string, string> = {
		info: 'Info',
		success: 'Success',
		warning: 'Warning',
		error: 'Error'
	};
</script>

<PageContainer title="Notifications" variant="default">
	<div class="notifications-page">
		<div class="toolbar">
			<div class="filter-tabs">
				<button
					onclick={() => (filter = 'all')}
					class="tab"
					class:active={filter === 'all'}
				>
					All
				</button>
				<button
					onclick={() => (filter = 'unread')}
					class="tab"
					class:active={filter === 'unread'}
				>
					Unread {#if count > 0}<span class="badge">{count}</span>{/if}
				</button>
			</div>
			<div class="actions">
				{#if count > 0}
					<button onclick={markAllRead} class="action-btn">Mark all read</button>
				{/if}
				{#if notifications.length > 0}
					<button onclick={clearAllNotifications} class="action-btn danger">Clear all</button>
				{/if}
			</div>
		</div>

		<div class="notifications-list">
			{#if filtered.length === 0}
				<Empty message={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'} illustration="default" />
			{:else}
				{#each filtered as notification (notification.id)}
					<div class="notification-item {typeStyles[notification.type]} {notification.read ? 'read' : ''}">
						<div class="notification-content">
							<div class="notification-meta">
								<span class="type-badge {notification.type}">{typeLabels[notification.type]}</span>
								<span class="timestamp">{formatTime(notification.timestamp)}</span>
							</div>
							<h3 class="notification-title">{notification.title}</h3>
							<p class="notification-message">{notification.message}</p>
						</div>
						<div class="notification-actions">
							{#if !notification.read}
								<button onclick={() => markRead(notification.id)} class="icon-btn" title="Mark as read" aria-label="Mark as read">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</button>
							{/if}
							<button onclick={() => removeNotification(notification.id)} class="icon-btn" title="Remove" aria-label="Remove">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</PageContainer>

<style>
	.notifications-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}

	.filter-tabs {
		display: flex;
		gap: 4px;
		background-color: var(--gray-2);
		padding: 4px;
		border-radius: 8px;
	}

	.tab {
		padding: 6px 14px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		color: var(--gray-7);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab.active {
		background-color: var(--theme-sidebar-background);
		color: var(--bcp-6);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background-color: var(--bcp-6);
		color: white;
		font-size: 11px;
		min-width: 18px;
		height: 18px;
		border-radius: 999px;
		padding: 0 5px;
		margin-left: 4px;
	}

	.actions {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		padding: 6px 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--bcp-6);
		background: transparent;
		border: 1px solid var(--gray-5);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		border-color: var(--bcp-6);
		background-color: var(--bcp-1);
	}

	.action-btn.danger {
		color: #ef4444;
	}

	.action-btn.danger:hover {
		border-color: #ef4444;
		background-color: #fef2f2;
	}

	.notifications-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.notification-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 8px;
		border-left-width: 4px;
		background-color: var(--theme-sidebar-background);
		border: 1px solid var(--gray-4);
		transition: opacity 0.2s;
	}

	.notification-item.read {
		opacity: 0.7;
	}

	.notification-content {
		flex: 1;
		min-width: 0;
	}

	.notification-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.type-badge {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.type-badge.info {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.type-badge.success {
		background-color: #dcfce7;
		color: #166534;
	}

	.type-badge.warning {
		background-color: #fef9c3;
		color: #854d0e;
	}

	.type-badge.error {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.timestamp {
		font-size: 12px;
		color: var(--gray-6);
	}

	.notification-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
	}

	.notification-message {
		font-size: 13px;
		color: var(--gray-7);
		margin: 2px 0 0;
	}

	.notification-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.icon-btn {
		padding: 6px;
		border-radius: 6px;
		color: var(--gray-6);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background-color: var(--gray-3);
		color: var(--gray-9);
	}
</style>
