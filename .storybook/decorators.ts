import type { Decorator } from '@storybook/svelte';

export const withTheme: Decorator = (storyFn, context) => {
  const theme = (context.globals.theme as string) || 'light';
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Inject CSS variables for Storybook preview (mirror ThemeProvider)
  const styleId = 'storybook-theme-vars';
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  const vars = getThemeCss(theme === 'dark');
  style.textContent = `:root { ${vars} }`;

  return storyFn();
};

function getThemeCss(dark: boolean): string {
  if (dark) {
    return `
      --theme-primary: #2e5adc;
      --theme-secondary: #07a499;
      --theme-error: #dc4446;
      --theme-warning: #d89614;
      --theme-icon-primary: #fafafa;
      --theme-icon-secondary: #595959;
      --theme-sidebar-background: #141414;
      --title: rgba(255,255,255,0.85);
      --primaryText: rgba(255,255,255,0.85);
      --secondaryText: rgba(255,255,255,0.45);
      --disable: rgba(255,255,255,0.30);
      --border: rgba(255,255,255,0.20);
      --dividers: rgba(255,255,255,0.12);
      --background: rgba(255,255,255,0.08);
      --tableHeader: rgba(255,255,255,0.04);
      --sidebarBackground: #141414;
    `;
  }
  return `
    --theme-primary: #3366ff;
    --theme-secondary: #05BDB1;
    --theme-error: #ff4d4f;
    --theme-warning: #faad14;
    --theme-icon-primary: #3366ff;
    --theme-icon-secondary: #b5f5ec;
    --theme-sidebar-background: #ffffff;
    --title: rgba(0,0,0,0.85);
    --primaryText: rgba(0,0,0,0.85);
    --secondaryText: rgba(0,0,0,0.45);
    --disable: rgba(0,0,0,0.25);
    --border: rgba(0,0,0,0.15);
    --dividers: rgba(0,0,0,0.06);
    --background: rgba(0,0,0,0.04);
    --tableHeader: rgba(0,0,0,0.02);
    --sidebarBackground: #fff;
  `;
}
