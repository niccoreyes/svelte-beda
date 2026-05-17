export interface Notification {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	read: boolean;
	timestamp: number;
}

let notifications = $state<Notification[]>([]);

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
	const newNotification: Notification = {
		...notification,
		id: crypto.randomUUID(),
		timestamp: Date.now(),
		read: false
	};
	notifications = [newNotification, ...notifications];
	return newNotification;
}

export function markRead(id: string): void {
	notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function markAllRead(): void {
	notifications = notifications.map((n) => ({ ...n, read: true }));
}

export function removeNotification(id: string): void {
	notifications = notifications.filter((n) => n.id !== id);
}

export function unreadCount(): number {
	return notifications.filter((n) => !n.read).length;
}

export function getNotifications(): Notification[] {
	return notifications;
}

export function getUnreadNotifications(): Notification[] {
	return notifications.filter((n) => !n.read);
}

export function clearAllNotifications(): void {
	notifications = [];
}
