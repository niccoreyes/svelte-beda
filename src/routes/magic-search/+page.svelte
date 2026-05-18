<script lang="ts">
	import { PageContainer, Spinner, Empty } from '$lib/components';
	import { magicSearch, type MagicSearchResult } from '$lib/ai/magic-search';
	import { getFHIRResources } from '$lib/fhir/client';
	import type { Bundle } from 'fhir/r4b';

	let query = $state('');
	let result = $state<MagicSearchResult | null>(null);
	let loading = $state(false);
	let bundle = $state<Bundle | null>(null);
	let error = $state<string | null>(null);

	const examples = [
		'patients with diabetes',
		'appointments today',
		'pending medications',
		'encounters for patient 123',
		'practitioner Smith',
		'lab results for hypertension',
		'completed procedures'
	];

	async function handleSearch() {
		if (!query.trim()) return;
		loading = true;
		result = null;
		bundle = null;
		error = null;

		try {
			const parsed = magicSearch(query);
			result = parsed;
			const response = await getFHIRResources(parsed.resourceType, parsed.searchParams);
			bundle = response;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';
		} finally {
			loading = false;
		}
	}

	function applyExample(q: string) {
		query = q;
		handleSearch();
	}

	let entries = $derived(bundle?.entry || []);
</script>

<PageContainer title="Magic Search" variant="default">
	<div class="magic-search-container">
		<div class="search-input-row">
			<input
				type="text"
				placeholder="Describe what you are looking for..."
				bind:value={query}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				class="magic-input"
			/>
			<button onclick={handleSearch} disabled={loading || !query.trim()} class="magic-button">
				{#if loading}
					<Spinner />
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				{/if}
				<span>Search</span>
			</button>
		</div>

		<div class="examples">
			<span class="examples-label">Try:</span>
			{#each examples as ex (ex)}
				<button onclick={() => applyExample(ex)} class="example-chip">{ex}</button>
			{/each}
		</div>

		{#if result}
			<div class="result-card">
				<h3 class="result-heading">AI Parsing</h3>
				<div class="result-grid">
					<div class="result-field">
						<span class="result-label">Resource Type</span>
						<span class="result-value">{result.resourceType}</span>
					</div>
					<div class="result-field">
						<span class="result-label">Explanation</span>
						<span class="result-value">{result.explanation}</span>
					</div>
					<div class="result-field full-width">
						<span class="result-label">Search Parameters</span>
						<pre class="result-code">{JSON.stringify(result.searchParams, null, 2)}</pre>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="error-message">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		{#if bundle && !loading}
			<div class="results-section">
				<h3 class="results-heading">Results ({bundle.total ?? entries.length})</h3>
				{#if entries.length === 0}
					<Empty message="No resources found for this query" />
				{:else}
					<div class="results-list">
						{#each entries as entry, i (i)}
						{@const resource = entry.resource as Record<string, unknown> & { resourceType?: string; id?: string } | undefined}
						{#if resource}
							{@const nameList = resource.name as Array<{ text?: string }> | undefined}
							{@const nameText = Array.isArray(nameList) ? nameList[0]?.text : undefined}
							{@const titleText = resource.title ? String(resource.title) : undefined}
							{@const codeObj = resource.code as { text?: string } | undefined}
							{@const codeText = codeObj?.text ? String(codeObj.text) : undefined}
							<div class="result-item">
								<div class="result-item-header">
									<span class="result-item-type">{resource.resourceType || 'Resource'}</span>
									{#if resource.id}
										<span class="result-item-id">#{resource.id}</span>
									{/if}
								</div>
								<p class="result-item-title">
									{nameText || titleText || codeText || JSON.stringify(resource).slice(0, 120)}
								</p>
							</div>
						{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</PageContainer>

<style>
	.magic-search-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.search-input-row {
		display: flex;
		gap: 8px;
	}

	.magic-input {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid var(--gray-5);
		border-radius: 8px;
		font-size: 16px;
		background-color: var(--theme-sidebar-background);
		color: var(--gray-10);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.magic-input:focus {
		outline: none;
		border-color: var(--bcp-6);
		box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
	}

	.magic-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background-color: var(--bcp-6);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
		white-space: nowrap;
	}

	.magic-button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.magic-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.examples {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.examples-label {
		font-size: 13px;
		color: var(--gray-7);
	}

	.example-chip {
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid var(--gray-5);
		background-color: var(--gray-1);
		color: var(--gray-8);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.example-chip:hover {
		border-color: var(--bcp-6);
		color: var(--bcp-6);
	}

	.result-card {
		background-color: var(--theme-sidebar-background);
		border: 1px solid var(--gray-4);
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
	}

	.result-heading {
		font-size: 16px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0 0 12px;
	}

	.result-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.result-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.result-field.full-width {
		grid-column: 1 / -1;
	}

	.result-label {
		font-size: 12px;
		font-weight: 500;
		color: var(--gray-7);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.result-value {
		font-size: 14px;
		color: var(--gray-9);
	}

	.result-code {
		font-size: 13px;
		background-color: var(--gray-2);
		padding: 12px;
		border-radius: 6px;
		color: var(--gray-9);
		overflow-x: auto;
		margin: 0;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #b91c1c;
		font-size: 14px;
	}

	.results-section {
		background-color: var(--theme-sidebar-background);
		border: 1px solid var(--gray-4);
		border-radius: 10px;
		padding: 20px;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
	}

	.results-heading {
		font-size: 16px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0 0 12px;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.result-item {
		padding: 12px;
		border: 1px solid var(--gray-4);
		border-radius: 8px;
		background-color: var(--gray-1);
	}

	.result-item-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.result-item-type {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--bcp-6);
		background-color: var(--bcp-1);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.result-item-id {
		font-size: 12px;
		color: var(--gray-7);
	}

	.result-item-title {
		font-size: 14px;
		color: var(--gray-9);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.search-input-row {
			flex-direction: column;
		}

		.result-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
