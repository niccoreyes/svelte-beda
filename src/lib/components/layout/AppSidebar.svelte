<script lang="ts">
	import { page } from '$app/stores';
	import {
		getThemePreference,
		setThemePreference,
		getSystemTheme,
		type ThemePreference
	} from '$lib/theme';
	import { setLocale, getCurrentLocale } from '$lib/i18n';
	import { browser } from '$app/environment';
	import {
		PatientsIcon,
		PractitionersIcon,
		EncountersIcon,
		ServicesIcon,
		MedicationsIcon,
		PrescriptionsIcon,
		InvoicesIcon,
		QuestionnairesIcon,
		DashboardIcon,
		MagicSearchIcon
	} from '$lib/icons/menu';
	import { getCurrentUser, isAuthenticated, logout } from '$lib/auth';
	import { Role } from '$lib/auth/permissions';

	interface Props {
		collapsed?: boolean;
		onToggle?: () => void;
	}

	let { collapsed = false, onToggle }: Props = $props();

	const allMenuItems = [
		{ label: 'Patients', href: '/patients', icon: PatientsIcon, roles: [Role.Patient, Role.Practitioner, Role.Receptionist, Role.Admin] },
		{ label: 'Practitioners', href: '/practitioners', icon: PractitionersIcon, roles: [Role.Admin] },
		{ label: 'Encounters', href: '/encounters', icon: EncountersIcon, roles: [Role.Practitioner, Role.Receptionist, Role.Admin] },
		{ label: 'Scheduling', href: '/scheduling', icon: DashboardIcon, roles: [Role.Practitioner, Role.Receptionist, Role.Admin] },
		{ label: 'Medications', href: '/medications', icon: MedicationsIcon, roles: [Role.Practitioner, Role.Admin] },
		{ label: 'Prescriptions', href: '/prescriptions', icon: PrescriptionsIcon, roles: [Role.Practitioner, Role.Admin] },
		{ label: 'Invoices', href: '/invoices', icon: InvoicesIcon, roles: [Role.Receptionist, Role.Admin] },
		{ label: 'Healthcare Services', href: '/healthcare-services', icon: ServicesIcon, roles: [Role.Admin] },
		{ label: 'Questionnaires', href: '/questionnaires', icon: QuestionnairesIcon, roles: [Role.Practitioner, Role.Admin] },
		{ label: 'Forms Library', href: '/forms', icon: QuestionnairesIcon, roles: [Role.Practitioner, Role.Admin] },
		{ label: 'Magic Search', href: '/magic-search', icon: MagicSearchIcon, roles: [Role.Practitioner, Role.Admin] }
	];

	const user = $derived(getCurrentUser());
	const currentRole = $derived(user?.role as Role | undefined);

	const menuItems = $derived(
		allMenuItems.filter((item) =>
			!currentRole || item.roles.includes(currentRole)
		)
	);

	const locales = [
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Espanol' },
		{ code: 'ru', label: 'Russian' },
		{ code: 'de', label: 'Deutsch' }
	];

	let currentPreference = $state<ThemePreference>('auto');
	let resolvedTheme = $state<'light' | 'dark'>('light');
	let currentLocale = $state('en');

	$effect(() => {
		if (browser) {
			currentPreference = getThemePreference();
			resolvedTheme = currentPreference === 'auto' ? getSystemTheme() : currentPreference;
			currentLocale = getCurrentLocale();
		}
	});

	function handleSetTheme(mode: ThemePreference) {
		setThemePreference(mode);
		currentPreference = mode;
		resolvedTheme = mode === 'auto' ? getSystemTheme() : mode;
	}

	function cycleTheme() {
		const modes: ThemePreference[] = ['light', 'dark', 'auto'];
		const idx = modes.indexOf(currentPreference);
		const next = modes[(idx + 1) % modes.length] as ThemePreference;
		handleSetTheme(next);
	}

	function handleSetLocale(locale: string) {
		setLocale(locale);
		currentLocale = locale;
	}

	function isActiveRoute(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}
</script>

<aside
	class="sidebar"
	class:collapsed
	style:width={collapsed ? '80px' : '248px'}
>
	<div class="sidebar-top">
		<div class="logo-wrapper" class:collapsed>
			<a href="/" class="logo-link">
				<img src="/logo.svg" alt="Beda EMR" class="logo-img" />
			</a>
		</div>

		<nav class="nav-menu">
			{#each menuItems as item}
				{@const active = isActiveRoute(item.href)}
				<a
					href={item.href}
					class="nav-item"
					class:active
					class:collapsed
					aria-current={active ? 'page' : undefined}
				>
					<span class="nav-icon">
						<item.icon />
					</span>
					{#if !collapsed}
						<span class="nav-label">{item.label}</span>
					{:else}
						<span class="nav-label-small">{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>

	<div class="sidebar-bottom" class:collapsed>
		<div class="divider"></div>

		<div class="bottom-item theme-toggle" class:collapsed>
			{#if collapsed}
				<button class="bottom-icon" onclick={cycleTheme} aria-label="Cycle theme">
					{#if resolvedTheme === 'dark'}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="5" />
							<line x1="12" y1="1" x2="12" y2="3" />
							<line x1="12" y1="21" x2="12" y2="23" />
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
							<line x1="1" y1="12" x2="3" y2="12" />
							<line x1="21" y1="12" x2="23" y2="12" />
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</button>
			{:else}
				<span class="bottom-icon">
					{#if resolvedTheme === 'dark'}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="5" />
							<line x1="12" y1="1" x2="12" y2="3" />
							<line x1="12" y1="21" x2="12" y2="23" />
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
							<line x1="1" y1="12" x2="3" y2="12" />
							<line x1="21" y1="12" x2="23" y2="12" />
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					{/if}
				</span>
			{/if}
			{#if !collapsed}
				<div class="theme-options">
					<button
						class="theme-option"
						class:active={currentPreference === 'light'}
						onclick={() => handleSetTheme('light')}
						aria-label="Light mode"
					>
						Light
					</button>
					<button
						class="theme-option"
						class:active={currentPreference === 'dark'}
						onclick={() => handleSetTheme('dark')}
						aria-label="Dark mode"
					>
						Dark
					</button>
					<button
						class="theme-option"
						class:active={currentPreference === 'auto'}
						onclick={() => handleSetTheme('auto')}
						aria-label="Auto mode"
					>
						Auto
					</button>
				</div>
			{/if}
		</div>

		{#if !collapsed}
			<div class="locale-wrapper">
				<select
					value={currentLocale}
					onchange={(e) => handleSetLocale(e.currentTarget.value)}
					class="locale-select"
				>
					{#each locales as locale}
						<option value={locale.code}>{locale.label}</option>
					{/each}
				</select>
			</div>
		{/if}

		{#if isAuthenticated()}
			<div class="divider"></div>
			<button
				onclick={logout}
				class="bottom-item"
				aria-label="Sign out"
			>
				<span class="bottom-icon">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
				</span>
				{#if !collapsed}
					<span class="bottom-label">Sign out</span>
				{/if}
			</button>
		{/if}

		{#if onToggle}
			<div class="divider"></div>
			<button
				onclick={onToggle}
				class="collapse-btn"
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if collapsed}
						<path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
					{:else}
						<path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					{/if}
				</svg>
				{#if !collapsed}
					<span>Collapse</span>
				{/if}
			</button>
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		height: 100vh;
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		background-color: var(--theme-sidebar-background);
		border-right: 1px solid var(--gray-4);
		transition: width 0.2s;
		z-index: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	:global(.dark) .sidebar {
		border-right-color: var(--gray-4);
	}

	.sidebar-top {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
	}

	.logo-wrapper {
		height: 68px;
		display: flex;
		align-items: center;
		padding: 0 24px;
		gap: 7px;
		transition: padding 0.2s;
		flex-shrink: 0;
	}

	.logo-wrapper.collapsed {
		padding: 0 20px;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 7px;
		text-decoration: none;
	}

	.logo-img {
		width: 100%;
		max-width: 120px;
		height: auto;
		min-width: 32px;
	}

	.nav-menu {
		padding: 0 4px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0 10px;
		height: 48px;
		line-height: 24px;
		width: 100%;
		margin: 0;
		color: var(--gray-8);
		border-radius: 6px;
		transition: all 0.2s;
		padding: 12px 16px;
		text-decoration: none;
		position: relative;
	}

	:global(.dark) .nav-item {
		color: var(--gray-8);
	}

	.nav-item:hover:not(.active) {
		background: transparent;
		color: var(--theme-primary);
	}

	.nav-item.active {
		background-color: var(--gray-3);
		color: var(--gray-13);
	}

	:global(.dark) .nav-item.active {
		background-color: var(--gray-3);
		color: var(--gray-13);
	}

	.nav-item.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 12px;
		bottom: 12px;
		width: 3px;
		background-color: var(--theme-primary);
		border-radius: 0 2px 2px 0;
	}

	.nav-item.collapsed {
		flex-direction: column;
		justify-content: center;
		padding: 12px 24px;
		gap: 0;
		height: 68px;
	}

	.nav-icon {
		min-width: 24px;
		min-height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-label {
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		transition: opacity 0.6s;
	}

	.nav-label-small {
		font-size: 9px;
		line-height: 14px;
		font-weight: 500;
		white-space: nowrap;
		margin-top: 6px;
		opacity: 0;
		transition: opacity 0s;
		height: 0;
		visibility: hidden;
	}

	.sidebar.collapsed .nav-label-small {
		opacity: 1;
		transition: opacity 0.2s;
		transition-delay: 0.18s;
		visibility: visible;
		height: auto;
	}

	.sidebar-bottom {
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
		transition: padding 0.2s;
	}

	.sidebar-bottom.collapsed {
		padding: 16px;
	}

	.divider {
		height: 1px;
		background-color: var(--gray-4);
		margin: 0 -20px;
		width: calc(100% + 40px);
		transition: all 0s;
	}

	.sidebar-bottom.collapsed .divider {
		margin: 0 -12px;
		width: calc(100% + 24px);
	}

	.bottom-item {
		display: flex;
		align-items: center;
		gap: 0 10px;
		width: 100%;
		padding: 8px 0;
		color: var(--gray-8);
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 14px;
		font-family: inherit;
		transition: color 0.2s;
	}

	.bottom-item:hover {
		color: var(--theme-primary);
	}

	.bottom-icon {
		min-width: 32px;
		height: 32px;
		width: 32px;
		border-radius: 6px;
		background-color: var(--gray-2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--gray-7);
		font-size: 16px;
		flex-shrink: 0;
	}

	:global(.dark) .bottom-icon {
		background-color: var(--gray-3);
	}

	.bottom-label {
		font-weight: 500;
		white-space: nowrap;
	}

	.locale-wrapper {
		padding: 4px 0;
	}

	.locale-select {
		width: 100%;
		padding: 6px 8px;
		font-size: 13px;
		border: 1px solid var(--gray-4);
		border-radius: 6px;
		background-color: var(--theme-sidebar-background);
		color: var(--gray-8);
		cursor: pointer;
		font-family: inherit;
	}

	:global(.dark) .locale-select {
		border-color: var(--gray-4);
		color: var(--gray-8);
	}

	.collapse-btn {
		display: flex;
		align-items: center;
		gap: 0 10px;
		padding: 8px 0;
		color: var(--gray-7);
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 13px;
		font-family: inherit;
		transition: color 0.2s;
		width: 100%;
	}

	.collapse-btn:hover {
		color: var(--theme-primary);
	}

	.theme-toggle {
		flex-wrap: wrap;
	}

	.theme-toggle.collapsed {
		justify-content: center;
		padding: 8px 0;
	}

	.theme-toggle .bottom-icon {
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		cursor: default;
	}

	.theme-toggle.collapsed .bottom-icon {
		cursor: pointer;
	}

	.theme-options {
		display: flex;
		gap: 4px;
		flex: 1;
	}

	.theme-option {
		flex: 1;
		padding: 4px 6px;
		font-size: 11px;
		font-weight: 500;
		border-radius: 4px;
		border: 1px solid var(--gray-4);
		background: transparent;
		color: var(--gray-8);
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.theme-option.active {
		background-color: var(--theme-primary);
		border-color: var(--theme-primary);
		color: #fff;
	}

	.theme-option:hover:not(.active) {
		border-color: var(--theme-primary);
		color: var(--theme-primary);
	}

	:global(.dark) .theme-option {
		border-color: var(--gray-4);
		color: var(--gray-8);
	}

	:global(.dark) .theme-option.active {
		background-color: var(--theme-primary);
		border-color: var(--theme-primary);
		color: #fff;
	}

	@media screen and (max-width: 767px) {
		.sidebar {
			display: none;
		}
	}
</style>
