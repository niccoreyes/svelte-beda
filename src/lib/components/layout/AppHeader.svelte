<script lang="ts">
	import { page } from '$app/stores';
	import NotificationCenter from '../NotificationCenter.svelte';
	import AIAssistantSidebar from '../ai/AIAssistantSidebar.svelte';
	import { unreadCount } from '$lib/state/notifications.svelte';

	const routeLabels: Record<string, string> = {
		'/': 'Home',
		'/patients': 'Patients',
		'/practitioners': 'Practitioners',
		'/encounters': 'Encounters',
		'/scheduling': 'Scheduling',
		'/medications': 'Medications',
		'/prescriptions': 'Prescriptions',
		'/invoices': 'Invoices',
		'/healthcare-services': 'Healthcare Services',
		'/questionnaires': 'Questionnaires',
		'/forms': 'Forms Library',
		'/magic-search': 'Magic Search',
		'/appointment/book': 'Book Appointment',
		'/signin': 'Sign In'
	};

	function getBreadcrumbs(path: string): Array<{ label: string; href: string }> {
		const crumbs = [{ label: 'Home', href: '/' }];
		const segments = path.split('/').filter(Boolean);
		let currentPath = '';
		for (const segment of segments) {
			currentPath += `/${segment}`;
			const label = routeLabels[currentPath] || segment;
			crumbs.push({ label, href: currentPath });
		}
		return crumbs;
	}

	let breadcrumbs = $derived(getBreadcrumbs($page.url.pathname));
	let currentPageTitle = $derived(breadcrumbs[breadcrumbs.length - 1]?.label || '');
	let notificationOpen = $state(false);
	let aiSidebarOpen = $state(false);
	let unread = $derived(unreadCount());
</script>

<NotificationCenter open={notificationOpen} onClose={() => (notificationOpen = false)} />
<AIAssistantSidebar
	open={aiSidebarOpen}
	onToggle={() => (aiSidebarOpen = !aiSidebarOpen)}
/>

<header class="page-header">
	<div class="header-inner">
		<nav class="breadcrumbs">
			{#each breadcrumbs as crumb, i}
				{#if i > 0}
					<span class="separator">/</span>
				{/if}
				<a href={crumb.href} class="crumb-link">{crumb.label}</a>
			{/each}
		</nav>
		<div class="header-right-row">
			<h1 class="page-title">{currentPageTitle}</h1>
			<button
				class="assistant-toggle"
				onclick={() => (aiSidebarOpen = !aiSidebarOpen)}
				aria-label="Toggle AI assistant"
				class:assistant-active={aiSidebarOpen}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</button>
			<button
				class="notification-bell"
				onclick={() => (notificationOpen = true)}
				aria-label="Open notifications"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				{#if unread > 0}
					<span class="unread-badge">{unread}</span>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	.page-header {
		background-color: var(--gray-1);
		display: flex;
		justify-content: center;
		padding: 0 24px;
	}

	.header-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 24px 20px;
		gap: 16px 0;
		max-width: 1120px;
		width: 100%;
	}

	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		line-height: 22px;
		color: var(--gray-7);
		flex-wrap: wrap;
	}

	.separator {
		color: var(--gray-6);
	}

	.crumb-link {
		color: var(--gray-7);
		text-decoration: none;
		transition: color 0.2s;
	}

	.crumb-link:hover {
		color: var(--theme-primary);
	}

	.crumb-link:last-child {
		color: var(--gray-9);
		font-weight: 500;
	}

	:global(.dark) .crumb-link:last-child {
		color: var(--gray-9);
	}

	.header-right-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.assistant-toggle {
		position: relative;
		padding: 8px;
		border-radius: 8px;
		background: transparent;
		border: none;
		color: var(--gray-7);
		cursor: pointer;
		transition: color 0.2s, background-color 0.2s;
	}

	.assistant-toggle:hover {
		color: var(--bcp-6);
		background-color: var(--gray-2);
	}

	.assistant-active {
		color: var(--bcp-6);
		background-color: var(--gray-2);
	}

	.notification-bell {
		position: relative;
		padding: 8px;
		border-radius: 8px;
		background: transparent;
		border: none;
		color: var(--gray-7);
		cursor: pointer;
		transition: color 0.2s, background-color 0.2s;
	}

	.notification-bell:hover {
		color: var(--bcp-6);
		background-color: var(--gray-2);
	}

	.unread-badge {
		position: absolute;
		top: 2px;
		right: 2px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		background-color: #ef4444;
		color: white;
		font-size: 10px;
		font-weight: 600;
		border-radius: 999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.page-title {
		font-size: 38px;
		line-height: 46px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
	}

	:global(.dark) .page-title {
		color: var(--gray-10);
	}
</style>
