<script lang="ts">
	import {
		PatientsIcon,
		PractitionersIcon,
		EncountersIcon,
		ServicesIcon,
		MedicationsIcon,
		PrescriptionsIcon,
		InvoicesIcon,
		QuestionnairesIcon,
		MagicSearchIcon
	} from '$lib/icons/menu';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	const menuItems = [
		{ label: 'Patients', href: '/patients', icon: PatientsIcon },
		{ label: 'Practitioners', href: '/practitioners', icon: PractitionersIcon },
		{ label: 'Encounters', href: '/encounters', icon: EncountersIcon },
		{ label: 'Scheduling', href: '/scheduling', icon: EncountersIcon },
		{ label: 'Medications', href: '/medications', icon: MedicationsIcon },
		{ label: 'Prescriptions', href: '/prescriptions', icon: PrescriptionsIcon },
		{ label: 'Invoices', href: '/invoices', icon: InvoicesIcon },
		{ label: 'Healthcare Services', href: '/healthcare-services', icon: ServicesIcon },
		{ label: 'Questionnaires', href: '/questionnaires', icon: QuestionnairesIcon },
		{ label: 'Forms Library', href: '/forms', icon: QuestionnairesIcon },
		{ label: 'Magic Search', href: '/magic-search', icon: MagicSearchIcon }
	];
</script>

<div class="drawer-overlay" role="dialog" aria-modal="true">
	<button class="backdrop" onclick={onClose} aria-label="Close drawer"></button>
	<div class="drawer-panel">
		<div class="drawer-header">
			<span class="drawer-title">Menu</span>
			<button onclick={onClose} class="close-btn" aria-label="Close menu">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
		<nav class="drawer-nav">
			{#each menuItems as item}
				<a
					href={item.href}
					class="drawer-item"
					onclick={onClose}
				>
					<span class="item-icon">
						<item.icon />
					</span>
					<span class="item-label">{item.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</div>

<style>
	.drawer-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		border: none;
		cursor: pointer;
	}

	.drawer-panel {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 280px;
		background-color: var(--theme-sidebar-background);
		box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
	}

	.drawer-header {
		height: 68px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
		border-bottom: 1px solid var(--gray-4);
		flex-shrink: 0;
	}

	.drawer-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--gray-10);
	}

	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--gray-7);
		transition: all 0.2s;
	}

	.close-btn:hover {
		background-color: var(--gray-3);
		color: var(--theme-primary);
	}

	.drawer-nav {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.drawer-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 6px;
		color: var(--gray-8);
		text-decoration: none;
		transition: all 0.2s;
		font-size: 14px;
		font-weight: 500;
	}

	.drawer-item:hover {
		background-color: var(--gray-3);
		color: var(--theme-primary);
	}

	.item-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.item-label {
		white-space: nowrap;
	}
</style>
