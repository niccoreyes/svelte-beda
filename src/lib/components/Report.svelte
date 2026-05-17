<script lang="ts">
	interface ReportSection {
		title: string;
		items: Array<{ key: string; value: string }>;
	}

	interface Props {
		title: string;
		sections: ReportSection[];
	}

	let { title, sections }: Props = $props();

	function handlePrint() {
		window.print();
	}

	function handleExportPDF() {
		// Placeholder for PDF export integration
		console.log('PDF export triggered for report:', title);
		alert('PDF export will be available in a future release.');
	}
</script>

<div class="report-container bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
		<div class="flex items-center gap-2">
			<button
				onclick={handlePrint}
				class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
				</svg>
				Print
			</button>
			<button
				onclick={handleExportPDF}
				class="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Export PDF
			</button>
		</div>
	</div>

	{#each sections as section}
		<div class="mb-6 last:mb-0">
			<h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
				{section.title}
			</h3>
			<dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
				{#each section.items as item}
					<div class="flex flex-col sm:flex-row sm:items-baseline py-1">
						<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3 shrink-0">{item.key}</dt>
						<dd class="text-sm text-gray-800 dark:text-gray-200 sm:w-2/3">{item.value}</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/each}
</div>

<style>
	@media print {
		.report-container {
			border: none;
			box-shadow: none;
		}
	}
</style>
