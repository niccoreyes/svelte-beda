<script lang="ts">
	import AppSidebar from './AppSidebar.svelte';
	import AppTabBar from './AppTabBar.svelte';
	import MobileDrawer from './MobileDrawer.svelte';
	import Footer from './Footer.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let sidebarCollapsed = $state(false);
	let mobileDrawerOpen = $state(false);
	let isMobile = $state(false);

	$effect(() => {
		const mql = window.matchMedia('(max-width: 767px)');
		isMobile = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});
</script>

<div class="layout-container">
	{#if !isMobile}
		<AppSidebar collapsed={sidebarCollapsed} onToggle={() => sidebarCollapsed = !sidebarCollapsed} />
	{:else}
		<AppTabBar onMenuClick={() => mobileDrawerOpen = true} />
	{/if}

	<div class="content-area" class:with-sidebar={!isMobile} style:--sidebar-width={sidebarCollapsed ? '80px' : '248px'}>
		<main class="main-content">
			{@render children?.()}
		</main>
		<Footer />
	</div>
</div>

{#if isMobile && mobileDrawerOpen}
	<MobileDrawer onClose={() => mobileDrawerOpen = false} />
{/if}

<style>
	.layout-container {
		display: flex;
		min-height: 100vh;
		position: relative;
		background-color: var(--gray-1);
	}

	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		background: transparent;
		margin-left: 0;
		transition: margin-left 0.2s;
	}

	.content-area.with-sidebar {
		margin-left: var(--sidebar-width);
	}

	.main-content {
		flex: 1;
		overflow: auto;
		padding-bottom: 64px;
	}

	@media screen and (max-width: 767px) {
		.layout-container {
			padding-top: 50px;
		}
	}
</style>
