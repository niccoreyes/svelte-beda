<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Spinner from './Spinner.svelte';

	const { Story } = defineMeta({
		title: 'Components/Spinner',
		component: Spinner
	});
</script>

<Story name="Default" />
