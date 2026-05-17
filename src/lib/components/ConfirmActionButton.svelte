<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		label: string;
		confirmTitle?: string;
		confirmMessage?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'primary' | 'danger' | 'secondary';
		onConfirm: () => void;
		disabled?: boolean;
	}

	let {
		label,
		confirmTitle = 'Confirm Action',
		confirmMessage = 'Are you sure you want to proceed?',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'primary',
		onConfirm,
		disabled = false
	}: Props = $props();

	let showModal = $state(false);

	function open() {
		if (!disabled) showModal = true;
	}

	function close() {
		showModal = false;
	}

	function confirm() {
		onConfirm();
		close();
	}

	const btnStyles: Record<string, string> = {
		primary: 'bg-primary text-white hover:opacity-90',
		danger: 'bg-red-600 text-white hover:bg-red-700',
		secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
	};
</script>

<button type="button" onclick={open} {disabled} class="px-4 py-2 rounded text-sm font-medium transition-colors {btnStyles[variant]} {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}">
	{label}
</button>

<Modal open={showModal} title={confirmTitle} onClose={close}>
	<div class="space-y-4">
		<p class="text-sm text-gray-700 dark:text-gray-300">{confirmMessage}</p>
		<div class="flex justify-end gap-3">
			<button
				type="button"
				onclick={close}
				class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
			>
				{cancelLabel}
			</button>
			<button
				type="button"
				onclick={confirm}
				class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</Modal>
