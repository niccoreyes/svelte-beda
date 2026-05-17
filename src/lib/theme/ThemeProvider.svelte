<script lang="ts">
	import { browser } from '$app/environment';
	import { getThemePreference, applyResolvedTheme, watchSystemTheme } from '$lib/theme';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		const mode = getThemePreference();
		applyResolvedTheme(mode);
		const unwatch = watchSystemTheme(() => {
			if (getThemePreference() === 'auto') {
				applyResolvedTheme('auto');
			}
		});
		return unwatch;
	});
</script>

<svelte:head>
	<style>
		:root {
			--theme-primary: #3366ff;
			--theme-secondary: #05BDB1;
			--theme-error: #ff4d4f;
			--theme-warning: #faad14;
			--theme-icon-primary: #3366ff;
			--theme-icon-secondary: #b5f5ec;
			--theme-sidebar-background: #ffffff;
			--bcp-1: #f0f5ff;
			--bcp-2: #d6e4ff;
			--bcp-3: #adc6ff;
			--bcp-4: #85a5ff;
			--bcp-5: #5c8dff;
			--bcp-6: #3366ff;
			--bcp-7: #254eda;
			--bcp-8: #1739b5;
			--bcp-9: #102693;
			--bcp-10: #091870;
			--bcs-1: #e6fffb;
			--bcs-2: #b5f5ec;
			--bcs-3: #87e8de;
			--bcs-4: #5cdbd3;
			--bcs-5: #36cfc9;
			--bcs-6: #05BDB1;
			--bcs-7: #08979c;
			--bcs-8: #006d75;
			--bcs-9: #00474f;
			--bcs-10: #002329;
			--ep-1: #fff2f0;
			--ep-2: #ffccc7;
			--ep-3: #ffa39e;
			--ep-4: #ff7875;
			--ep-5: #ff4d4f;
			--ep-6: #f5222d;
			--ep-7: #cf1322;
			--ep-8: #a8071a;
			--ep-9: #820014;
			--ep-10: #5c0011;
			--wp-1: #fffbe6;
			--wp-2: #fff1b8;
			--wp-3: #ffe58f;
			--wp-4: #ffd666;
			--wp-5: #ffc53d;
			--wp-6: #faad14;
			--wp-7: #d48806;
			--wp-8: #ad6800;
			--wp-9: #874d00;
			--wp-10: #613400;
			--gray-1: #ffffff;
			--gray-2: #fafafa;
			--gray-3: #f5f5f5;
			--gray-4: #f0f0f0;
			--gray-5: #d9d9d9;
			--gray-6: #bfbfbf;
			--gray-7: #8c8c8c;
			--gray-8: #595959;
			--gray-9: #434343;
			--gray-10: #262626;
			--gray-11: #1f1f1f;
			--gray-12: #141414;
			--gray-13: #000000;
			--title: rgba(0,0,0,0.85);
			--primaryText: rgba(0,0,0,0.85);
			--secondaryText: rgba(0,0,0,0.45);
			--disable: rgba(0,0,0,0.25);
			--border: rgba(0,0,0,0.15);
			--dividers: rgba(0,0,0,0.06);
			--background: rgba(0,0,0,0.04);
			--tableHeader: rgba(0,0,0,0.02);
			--sidebarBackground: #fff;
		}

		.dark {
			--theme-primary: #2e5adc;
			--theme-secondary: #07a499;
			--theme-error: #dc4446;
			--theme-warning: #d89614;
			--theme-icon-primary: #fafafa;
			--theme-icon-secondary: #595959;
			--theme-sidebar-background: #141414;
			--bcp-1: #14182c;
			--bcp-2: #172145;
			--bcp-3: #1d2d5b;
			--bcp-4: #22397e;
			--bcp-5: #2849ad;
			--bcp-6: #2e5adc;
			--bcp-7: #557ee8;
			--bcp-8: #7fa3f3;
			--bcp-9: #a8c5f8;
			--bcp-10: #d2e2fa;
			--bcs-1: #112222;
			--bcs-2: #0f3533;
			--bcs-3: #104743;
			--bcs-4: #0d605b;
			--bcs-5: #0a827a;
			--bcs-6: #07a499;
			--bcs-7: #24b7a9;
			--bcs-8: #48ccbb;
			--bcs-9: #71ddca;
			--bcs-10: #9eecdc;
			--ep-1: #2c1618;
			--ep-2: #451d1f;
			--ep-3: #5b2526;
			--ep-4: #7e2e2f;
			--ep-5: #ad393a;
			--ep-6: #dc4446;
			--ep-7: #e86e6b;
			--ep-8: #f39c97;
			--ep-9: #f8c6c2;
			--ep-10: #faedec;
			--wp-1: #2b2111;
			--wp-2: #443111;
			--wp-3: #594214;
			--wp-4: #7c5914;
			--wp-5: #aa7714;
			--wp-6: #d89614;
			--wp-7: #e8b339;
			--wp-8: #f3cc62;
			--wp-9: #f8df8b;
			--wp-10: #faedb5;
			--gray-1: #000000;
			--gray-2: #141414;
			--gray-3: #1f1f1f;
			--gray-4: #262626;
			--gray-5: #434343;
			--gray-6: #595959;
			--gray-7: #8c8c8c;
			--gray-8: #bfbfbf;
			--gray-9: #d9d9d9;
			--gray-10: #f0f0f0;
			--gray-11: #f5f5f5;
			--gray-12: #fafafa;
			--gray-13: #ffffff;
			--title: rgba(255,255,255,0.85);
			--primaryText: rgba(255,255,255,0.85);
			--secondaryText: rgba(255,255,255,0.45);
			--disable: rgba(255,255,255,0.30);
			--border: rgba(255,255,255,0.20);
			--dividers: rgba(255,255,255,0.12);
			--background: rgba(255,255,255,0.08);
			--tableHeader: rgba(255,255,255,0.04);
			--sidebarBackground: #141414;
		}
	</style>
</svelte:head>

{@render children()}
