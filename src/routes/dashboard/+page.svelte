<script lang="ts">
	import { PageContainer, Spinner, Empty } from '$lib/components';
	import Dashboards from '$lib/components/dashboard/Dashboards.svelte';
	import type { DashboardConfig, DashboardWidgetConfig } from '$lib/dashboard/config';
	import { DEFAULT_DASHBOARD_CONFIG } from '$lib/dashboard/config';
	import { getFHIRResources } from '$lib/fhir/client';
	import type { Bundle } from 'fhir/r4b';

	let config = $state<DashboardConfig>({ ...DEFAULT_DASHBOARD_CONFIG });
	let widgetData = $state<Record<string, Bundle>>({});
	let loadingWidgets = $state<Record<string, boolean>>({});
	let editMode = $state(false);

	async function loadWidgetData(widget: DashboardWidgetConfig) {
		if (!widget.resourceType) return;
		loadingWidgets = { ...loadingWidgets, [widget.type]: true };
		try {
			const params: Record<string, string> = {};
			if (widget.query) {
				params['_summary'] = 'false';
				if (widget.query.includes('=')) {
					const parts = widget.query.split('&');
					for (const part of parts) {
						const [k, v] = part.split('=');
						if (k && v) params[k] = v;
					}
				}
			}
			params['_count'] = '5';
			const bundle = await getFHIRResources(widget.resourceType, params);
			widgetData = { ...widgetData, [widget.type]: bundle };
		} catch {
			widgetData = { ...widgetData, [widget.type]: { resourceType: 'Bundle', type: 'searchset', entry: [] } };
		} finally {
			loadingWidgets = { ...loadingWidgets, [widget.type]: false };
		}
	}

	$effect(() => {
		for (const widget of config.widgets) {
			if (widget.resourceType && !widgetData[widget.type]) {
				loadWidgetData(widget);
			}
		}
	});

	function moveWidget(index: number, direction: -1 | 1) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= config.widgets.length) return;
		const widgets = [...config.widgets];
		const temp = widgets[index]!;
		widgets[index] = widgets[newIndex]!;
		widgets[newIndex] = temp;
		config = { ...config, widgets };
	}

	function removeWidget(index: number) {
		const widgets = config.widgets.filter((_, i) => i !== index);
		config = { ...config, widgets };
	}

	function addWidget() {
		const widgets = [
			...config.widgets,
			{ type: `widget-${Date.now()}`, title: 'New Widget', resourceType: 'Patient' }
		];
		config = { ...config, widgets };
	}
</script>

<PageContainer title="Dashboard" variant="default">
	<div class="dashboard-page">
		<div class="dashboard-toolbar">
			<button
				onclick={() => (editMode = !editMode)}
				class="edit-toggle"
			>
				{#if editMode}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Done
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					Configure
				{/if}
			</button>
			{#if editMode}
				<button onclick={addWidget} class="edit-toggle">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Add Widget
				</button>
			{/if}
		</div>

		{#if editMode}
			<div class="config-panel">
				{#each config.widgets as widget, i}
					<div class="widget-config-row">
						<input
							type="text"
							value={widget.title}
							oninput={(e) => {
								const widgets = [...config.widgets];
								const w = widgets[i] as typeof widget;
								widgets[i] = { ...w, title: e.currentTarget.value };
								config = { ...config, widgets };
							}}
							class="config-input"
							placeholder="Title"
						/>
						<input
							type="text"
							value={widget.resourceType || ''}
							oninput={(e) => {
								const widgets = [...config.widgets];
								const w = widgets[i] as typeof widget;
								widgets[i] = { ...w, resourceType: e.currentTarget.value };
								config = { ...config, widgets };
							}}
							class="config-input"
							placeholder="Resource Type"
						/>
						<div class="config-actions">
							<button onclick={() => moveWidget(i, -1)} disabled={i === 0} class="icon-btn" aria-label="Move up">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
								</svg>
							</button>
							<button onclick={() => moveWidget(i, 1)} disabled={i === config.widgets.length - 1} class="icon-btn" aria-label="Move down">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							<button onclick={() => removeWidget(i)} class="icon-btn danger" aria-label="Remove">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<Dashboards {config}>
			{#snippet widget(type, title)}
				{@const data = widgetData[type]}
				{@const loading = loadingWidgets[type]}
				<div class="widget-content">
					{#if loading}
						<Spinner />
					{:else if data && data.entry && data.entry.length > 0}
						<ul class="widget-list">
							{#each data.entry.slice(0, 5) as entry}
								{@const resource = entry.resource as Record<string, unknown> & { resourceType?: string; id?: string } | undefined}
								{#if resource}
									{@const nameList = resource.name as Array<{ text?: string }> | undefined}
									{@const nameText = Array.isArray(nameList) ? nameList[0]?.text : undefined}
									{@const titleText = resource.title ? String(resource.title) : undefined}
									{@const codeObj = resource.code as { text?: string } | undefined}
									{@const codeText = codeObj?.text ? String(codeObj.text) : undefined}
									<li class="widget-list-item">
										<a href="/{(resource.resourceType || '').toLowerCase()}s/{resource.id}" class="widget-link">
											<span class="widget-link-label">
												{nameText || titleText || codeText || `${resource.resourceType || 'Resource'} ${resource.id || ''}`}
											</span>
											<svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
											</svg>
										</a>
									</li>
								{/if}
							{/each}
						</ul>
					{:else}
						<Empty message="No data" />
					{/if}
				</div>
			{/snippet}
		</Dashboards>
	</div>
</PageContainer>

<style>
	.dashboard-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.dashboard-toolbar {
		display: flex;
		gap: 8px;
	}

	.edit-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: 6px;
		border: 1px solid var(--gray-5);
		background-color: var(--theme-sidebar-background);
		color: var(--gray-8);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-toggle:hover {
		border-color: var(--bcp-6);
		color: var(--bcp-6);
	}

	.config-panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background-color: var(--theme-sidebar-background);
		border: 1px solid var(--gray-4);
		border-radius: 10px;
	}

	.widget-config-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.config-input {
		flex: 1;
		min-width: 120px;
		padding: 6px 10px;
		border: 1px solid var(--gray-5);
		border-radius: 6px;
		font-size: 13px;
		background-color: var(--gray-1);
		color: var(--gray-10);
	}

	.config-input:focus {
		outline: none;
		border-color: var(--bcp-6);
	}

	.config-actions {
		display: flex;
		gap: 4px;
	}

	.icon-btn {
		padding: 6px;
		border-radius: 6px;
		color: var(--gray-6);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.icon-btn:hover:not(:disabled) {
		background-color: var(--gray-3);
		color: var(--gray-9);
	}

	.icon-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.icon-btn.danger:hover {
		background-color: #fef2f2;
		color: #ef4444;
	}

	.widget-content {
		min-height: 120px;
	}

	.widget-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.widget-list-item {
		border-bottom: 1px solid var(--gray-4);
	}

	.widget-list-item:last-child {
		border-bottom: none;
	}

	.widget-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 4px;
		text-decoration: none;
		color: var(--gray-9);
		font-size: 13px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.widget-link:hover {
		background-color: var(--gray-2);
	}

	.widget-link-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
