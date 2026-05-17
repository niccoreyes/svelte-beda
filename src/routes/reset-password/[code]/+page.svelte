<script lang="ts">
	import { page } from '$app/stores';
	import { PageContainer, Empty } from '$lib/components';

	const code = $page.params.code;
	// TODO: implement reset password logic with code
	code;
</script>

<PageContainer title="Reset Password" variant="default">
	<Empty message="Reset Password coming soon" />
</PageContainer>
