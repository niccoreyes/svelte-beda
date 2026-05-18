<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
		roomName: string;
		userName: string;
		jwt?: string;
	}

	let { roomName, userName, jwt }: Props = $props();

	function buildUrl(): string {
		const base = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
		const params = new SvelteURLSearchParams();
		params.append('config.requireDisplayName', 'true');
		params.append('config.startWithAudioMuted', 'false');
		params.append('config.startWithVideoMuted', 'false');
		params.append('config.prejoinPageEnabled', 'false');
		params.append('config.displayName', userName);
		params.append('interfaceConfig.SHOW_JITSI_WATERMARK', 'false');
		params.append('interfaceConfig.SHOW_BRAND_WATERMARK', 'false');
		if (jwt) {
			params.append('jwt', jwt);
		}
		return `${base}#${params.toString()}`;
	}

	let src = $derived(buildUrl());
</script>

<div class="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-black">
	<iframe
		{src}
		title={`Video call: ${roomName}`}
		allow="camera; microphone; fullscreen; display-capture; autoplay"
		class="w-full h-full min-h-[400px] border-0 rounded-lg"
	></iframe>
</div>
