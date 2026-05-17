<script lang="ts">
	import { page } from '$app/stores';

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
</script>

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
		<h1 class="page-title">{currentPageTitle}</h1>
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
