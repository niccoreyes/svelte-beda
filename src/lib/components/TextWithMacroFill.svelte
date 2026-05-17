<script lang="ts">
	interface Props {
		text: string;
		macros: Record<string, string>;
	}

	let { text, macros }: Props = $props();

	const expandedText = $derived(() => {
		return text.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
			return macros[key] ?? `{{${key}}}`;
		});
	});
</script>

<span class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{expandedText()}</span>
