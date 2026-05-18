<script lang="ts">
	import { Modal } from '$lib/components';

	interface Props {
		open: boolean;
		onClose: () => void;
		onSelect: (type: string) => void;
	}

	let { open, onClose, onSelect }: Props = $props();

	const documentTypes = [
		{ type: 'note', label: 'Clinical Note', description: 'Progress note, admission note, discharge summary', icon: '📝' },
		{ type: 'referral', label: 'Referral', description: 'Referral to another provider or specialist', icon: '↗' },
		{ type: 'prescription', label: 'Prescription', description: 'Medication or device prescription', icon: '💊' },
		{ type: 'lab-order', label: 'Lab Order', description: 'Laboratory test requisition', icon: '🧪' },
		{ type: 'imaging-order', label: 'Imaging Order', description: 'Radiology or imaging requisition', icon: '📷' },
		{ type: 'procedure-order', label: 'Procedure Order', description: 'Procedure or surgery order', icon: '🔬' },
		{ type: 'care-plan', label: 'Care Plan', description: 'Patient care plan document', icon: '📋' },
		{ type: 'consent', label: 'Consent Form', description: 'Informed consent document', icon: '✍' }
	];
</script>

<Modal {open} title="Create New Document" onClose={onClose}>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		{#each documentTypes as docType (docType.type)}
			<button
				onclick={() => onSelect(docType.type)}
				class="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
			>
				<div class="flex items-start gap-3">
					<span class="text-2xl">{docType.icon}</span>
					<div>
						<p class="text-sm font-medium text-gray-900 dark:text-white">{docType.label}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{docType.description}</p>
					</div>
				</div>
			</button>
		{/each}
	</div>
</Modal>
