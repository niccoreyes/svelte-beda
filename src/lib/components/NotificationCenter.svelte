<script lang="ts">
	import {
		getNotifications,
		markRead,
		markAllRead,
		removeNotification,
		unreadCount
	} from '$lib/state/notifications.svelte';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = false, onClose }: Props = $props();

	let notifications = $derived(getNotifications());
	let count = $derived(unreadCount());
	let filter = $state<'all' | 'unread'>('all');

	let filtered = $derived(
		filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
	);

	function handleMarkRead(id: string) {
		markRead(id);
	}

	function handleMarkAllRead() {
		markAllRead();
	}

	function handleRemove(id: string) {
		removeNotification(id);
	}

	function formatTime(ts: number): string {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
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
</script>

{#if open}
	<div class="fixed inset-0 z-40" role="dialog" aria-modal="true">
		<button class="absolute inset-0 bg-black/30" onclick={onClose} aria-label="Close notifications"></button>
		<div class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
				<div class="flex items-center gap-2">
					{#if count > 0}
						<button
							onclick={handleMarkAllRead}
							class="text-xs text-primary hover:underline"
						>
							Mark all read
						</button>
					{/if}
					<button onclick={onClose} class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
						<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<div class="flex border-b border-gray-200 dark:border-gray-700">
				<button
					onclick={() => (filter = 'all')}
					class="flex-1 py-2 text-sm font-medium {filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					All
				</button>
				<button
					onclick={() => (filter = 'unread')}
					class="flex-1 py-2 text-sm font-medium {filter === 'unread' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					Unread {#if count > 0}<span class="ml-1 text-xs bg-primary text-white rounded-full px-1.5 py-0.5">{count}</span>{/if}
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-2 space-y-1">
				{#if filtered.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
						<svg class="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<p class="text-sm">No notifications</p>
					</div>
				{:else}
					{#each filtered as notification (notification.id)}
						<div
							class="relative p-3 rounded border-l-4 {typeStyles[notification.type]} {notification.read ? 'opacity-70' : ''}"
						>
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
									<p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{notification.message}</p>
									<p class="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
								</div>
								<div class="flex items-center gap-1 flex-shrink-0">
									{#if !notification.read}
										<button
											onclick={() => handleMarkRead(notification.id)}
											class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
											aria-label="Mark as read"
											title="Mark as read"
										>
											<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</button>
									{/if}
									<button
										onclick={() => handleRemove(notification.id)}
										class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
										aria-label="Remove notification"
										title="Remove"
									>
										<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
