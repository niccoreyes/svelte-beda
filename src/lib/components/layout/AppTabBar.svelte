<script lang="ts">
	interface Props {
		onMenuClick?: () => void;
	}

	let { onMenuClick }: Props = $props();
</script>

<div class="tab-bar">
	<a href="/" class="logo-link">
		<img src="/logo.svg" alt="Beda EMR" class="logo-img" />
	</a>
	<button
		onclick={onMenuClick}
		class="menu-btn"
		aria-label="Open menu"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</button>
</div>

<style>
	.tab-bar {
		position: fixed;
		height: 50px;
		left: 0;
		right: 0;
		top: 0;
		background-color: var(--gray-1);
		z-index: 11;
		border-bottom: 1px solid var(--gray-4);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	:global(.dark) .tab-bar {
		background-color: var(--gray-1);
		border-bottom-color: var(--gray-4);
	}

	.logo-link {
		height: 50px;
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 0 24px;
		text-decoration: none;
	}

	.logo-img {
		width: 80px;
		height: auto;
	}

	.menu-btn {
		height: 50px;
		width: auto;
		min-width: 0;
		padding: 0 16px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--gray-7);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.menu-btn:hover {
		background: transparent;
		color: var(--theme-primary);
	}

	@media screen and (min-width: 768px) {
		.tab-bar {
			display: none;
		}
	}
</style>
