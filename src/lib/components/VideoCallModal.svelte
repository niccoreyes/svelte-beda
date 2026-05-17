<script lang="ts">
	import Modal from './Modal.svelte';
	import VideoCall from './VideoCall.svelte';

	interface Props {
		open?: boolean;
		roomName: string;
		userName: string;
		jwt?: string;
		onClose?: () => void;
	}

	let { open = false, roomName, userName, jwt, onClose }: Props = $props();
</script>

<Modal {open} title="Video Call" onClose={onClose}>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<span class="text-sm text-[var(--gray-7)]">Room: <span class="font-medium text-[var(--gray-10)]">{roomName}</span></span>
			<button
				onclick={onClose}
				class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
			>
				End Call
			</button>
		</div>
		<VideoCall {roomName} {userName} {jwt} />
	</div>
</Modal>
