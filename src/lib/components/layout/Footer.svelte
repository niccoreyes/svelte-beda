<footer class="footer">
	Beda EMR © {new Date().getFullYear()}
</footer>

<style>
	.footer {
		height: 40px;
		background-color: var(--theme-sidebar-background);
		border-top: 1px solid var(--gray-4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: var(--gray-6);
		flex-shrink: 0;
	}

	:global(.dark) .footer {
		border-top-color: var(--gray-4);
		color: var(--gray-6);
	}
</style>
