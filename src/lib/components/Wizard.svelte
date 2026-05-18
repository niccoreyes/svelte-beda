<script lang="ts">
	interface Step {
		title: string;
		description?: string;
	}

	interface Props {
		steps: Step[];
		currentStep?: number;
		children?: import('svelte').Snippet<[number]>;
		onStepChange?: (step: number) => void;
		onComplete?: () => void;
	}

	let { steps, currentStep = 0, children, onStepChange, onComplete }: Props = $props();

	// svelte-ignore state_referenced_locally (intentional initial-value-only; wizard is self-navigating)
	let step = $state(currentStep);

	function goNext() {
		if (step < steps.length - 1) {
			step += 1;
			onStepChange?.(step);
		} else {
			onComplete?.();
		}
	}

	function goBack() {
		if (step > 0) {
			step -= 1;
			onStepChange?.(step);
		}
	}

	function goTo(s: number) {
		if (s >= 0 && s < steps.length) {
			step = s;
			onStepChange?.(step);
		}
	}

	const progress = $derived(((step + 1) / steps.length) * 100);
</script>

<div class="wizard">
	<div class="wizard-header">
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
		<div class="steps-indicator">
			{#each steps as s, i}
				<button
					onclick={() => goTo(i)}
					class="step-dot"
					class:active={i === step}
					class:completed={i < step}
					aria-label={`Step ${i + 1}: ${s.title}`}
					disabled={i > step}
				>
					<span class="step-number">{i + 1}</span>
				</button>
				{#if i < steps.length - 1}
					<div class="step-connector" class:completed={i < step}></div>
				{/if}
			{/each}
		</div>
		<div class="step-info">
			<h3 class="step-title">{steps[step]?.title}</h3>
			{#if steps[step]?.description}
				<p class="step-description">{steps[step]?.description}</p>
			{/if}
		</div>
	</div>

	<div class="wizard-body">
		{@render children?.(step)}
	</div>

	<div class="wizard-footer">
		<button
			onclick={goBack}
			disabled={step === 0}
			class="btn-secondary"
		>
			Previous
		</button>
		<button
			onclick={goNext}
			class="btn-primary"
		>
			{step === steps.length - 1 ? 'Complete' : 'Next'}
		</button>
	</div>
</div>

<style>
	.wizard {
		background-color: var(--theme-sidebar-background);
		border: 1px solid var(--gray-4);
		border-radius: 10px;
		overflow: hidden;
	}

	.wizard-header {
		padding: 20px 24px;
		border-bottom: 1px solid var(--gray-4);
	}

	.progress-bar {
		height: 4px;
		background-color: var(--gray-4);
		border-radius: 2px;
		margin-bottom: 16px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--bcp-6);
		transition: width 0.3s ease;
	}

	.steps-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
	}

	.step-dot {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid var(--gray-5);
		background-color: var(--theme-sidebar-background);
		color: var(--gray-7);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 13px;
		font-weight: 600;
		padding: 0;
	}

	.step-dot:hover:not(:disabled) {
		border-color: var(--bcp-6);
		color: var(--bcp-6);
	}

	.step-dot.active {
		border-color: var(--bcp-6);
		background-color: var(--bcp-6);
		color: white;
	}

	.step-dot.completed {
		border-color: var(--bcp-6);
		background-color: var(--bcp-6);
		color: white;
	}

	.step-dot:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.step-connector {
		width: 40px;
		height: 2px;
		background-color: var(--gray-5);
		margin: 0 4px;
		transition: background-color 0.2s;
	}

	.step-connector.completed {
		background-color: var(--bcp-6);
	}

	.step-info {
		text-align: center;
	}

	.step-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--gray-10);
		margin: 0;
	}

	.step-description {
		font-size: 13px;
		color: var(--gray-7);
		margin: 4px 0 0;
	}

	.wizard-body {
		padding: 24px;
		min-height: 200px;
	}

	.wizard-footer {
		display: flex;
		justify-content: space-between;
		padding: 16px 24px;
		border-top: 1px solid var(--gray-4);
		gap: 12px;
	}

	.btn-primary {
		padding: 8px 16px;
		background-color: var(--bcp-6);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-secondary {
		padding: 8px 16px;
		background-color: transparent;
		color: var(--gray-8);
		border: 1px solid var(--gray-5);
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover:not(:disabled) {
		border-color: var(--gray-6);
		color: var(--gray-9);
	}

	.btn-secondary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
