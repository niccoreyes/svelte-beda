<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty } from '$lib/components';

	const id = $page.params.id;
</script>

<PageContainer title="Edit Questionnaire" variant="default">
	<Empty message="Questionnaire builder edit mode coming soon. Questionnaire ID: {id}" />
</PageContainer>
