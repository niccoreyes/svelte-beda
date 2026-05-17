<script lang="ts">
	import { Chart, registerables, type ChartData, type ChartOptions } from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import { onDestroy } from 'svelte';

	Chart.register(...registerables);

	interface Props {
		type?: 'line' | 'bar' | 'area';
		data: ChartData;
		options?: ChartOptions;
	}

	let { type = 'line', data, options = {} }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	function getThemeColor(variable: string): string {
		return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || '#3366ff';
	}

	function buildOptions(): ChartOptions {
		const textColor = getThemeColor('--gray-7');
		const gridColor = getThemeColor('--gray-4');
		const bgColor = getThemeColor('--theme-sidebar-background');

		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: {
						color: textColor,
						font: { family: 'Inter, sans-serif', size: 12 }
					}
				},
				tooltip: {
					backgroundColor: bgColor,
					titleColor: textColor,
					bodyColor: textColor,
					borderColor: gridColor,
					borderWidth: 1
				}
			},
			scales: {
				x: {
					grid: { color: gridColor },
					ticks: { color: textColor, font: { family: 'Inter, sans-serif', size: 11 } }
				},
				y: {
					grid: { color: gridColor },
					ticks: { color: textColor, font: { family: 'Inter, sans-serif', size: 11 } }
				}
			},
			...options
		};
	}

	function prepareData(): ChartData {
		const primaryColor = getThemeColor('--bcp-6');
		const secondaryColor = getThemeColor('--bcs-6');
		const areaFill = getThemeColor('--bcp-1');

		const datasets = data.datasets?.map((ds, i) => {
			const color = i === 0 ? primaryColor : secondaryColor;
			return {
				...ds,
				backgroundColor: type === 'area' ? areaFill : color,
				borderColor: color,
				fill: type === 'area',
				borderWidth: 2,
				pointBackgroundColor: color,
				pointBorderColor: getThemeColor('--theme-sidebar-background'),
				pointBorderWidth: 2,
				tension: 0.3
			};
		});

		return { ...data, datasets };
	}

	$effect(() => {
		if (!canvas) return;

		if (chartInstance) {
			chartInstance.destroy();
		}

		const preparedData = prepareData();
		const builtOptions = buildOptions();

		chartInstance = new Chart(canvas, {
			type: type === 'area' ? 'line' : type,
			data: preparedData,
			options: builtOptions
		});
	});

	onDestroy(() => {
		chartInstance?.destroy();
		chartInstance = null;
	});
</script>

<div class="chart-wrapper">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-wrapper {
		position: relative;
		width: 100%;
		height: 320px;
	}
</style>
