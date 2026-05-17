<script lang="ts">
	import type { Observation } from 'fhir/r4b';
	import { humanDate } from '$lib/utils';

	export interface ObservationTypeConfig {
		code: string;
		display: string;
	}

	interface Props {
		observationType: ObservationTypeConfig;
		observations: Observation[];
	}

	let { observationType, observations }: Props = $props();

	function getValueDisplay(obs: Observation): string {
		if (obs.valueQuantity) {
			return `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}`.trim();
		}
		if (obs.valueString) {
			return obs.valueString;
		}
		if (obs.component && obs.component.length > 0) {
			return obs.component
				.map((c) => {
					const code = c.code?.coding?.[0]?.display || c.code?.text || '';
					const val = c.valueQuantity ? `${c.valueQuantity.value} ${c.valueQuantity.unit || ''}` : c.valueString || '';
					return `${code}: ${val}`.trim();
				})
				.filter(Boolean)
				.join('; ');
		}
		return '-';
	}

	function getDateKey(dateStr?: string): string {
		if (!dateStr) return '';
		return humanDate(dateStr);
	}

	const sortedObs = $derived(
		[...observations].sort((a, b) => {
			const da = a.effectiveDateTime || a.issued || '';
			const db = b.effectiveDateTime || b.issued || '';
			return new Date(da).getTime() - new Date(db).getTime();
		})
	);

	const uniqueDates = $derived(
		[...new Set(sortedObs.map((o) => getDateKey(o.effectiveDateTime || o.issued)).filter(Boolean))]
	);

	const latestObs = $derived(
		sortedObs.length > 0 ? sortedObs[sortedObs.length - 1] : null
	);
</script>

<tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
	<td class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">
		{observationType.display}
	</td>
	{#each uniqueDates as date}
		{@const obs = sortedObs.find((o) => getDateKey(o.effectiveDateTime || o.issued) === date)}
		<td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 text-center">
			{obs ? getValueDisplay(obs) : '-'}
		</td>
	{/each}
	{#if uniqueDates.length === 0}
		<td class="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 text-center">-</td>
	{/if}
	<td class="px-3 py-2 text-sm font-semibold text-primary text-center">
		{latestObs ? getValueDisplay(latestObs) : '-'}
	</td>
</tr>
