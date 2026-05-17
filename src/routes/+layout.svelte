<script lang="ts">
	import '../app.css';
	import { BaseLayout } from '$lib/components';
	import ThemeProvider from '$lib/theme/ThemeProvider.svelte';
	import { setupI18n } from '$lib/i18n';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	setupI18n();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Beda EMR</title>
</svelte:head>

<ThemeProvider>
	<BaseLayout>
		{@render children()}
	</BaseLayout>
</ThemeProvider>
