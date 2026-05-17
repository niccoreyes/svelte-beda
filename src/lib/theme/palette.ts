export const brandColors = {
    primary: '#3366ff',
    secondary: '#05BDB1',
};

export const functionalColors = {
    link: brandColors.primary,
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
};

export const colors = {
    ...brandColors,
    ...functionalColors,
};

const neutralColors = {
    light: {
        title: 'rgba(0,0,0,0.85)',
        primaryText: 'rgba(0,0,0,0.85)',
        secondaryText: 'rgba(0,0,0,0.45)',
        disable: 'rgba(0,0,0,0.25)',
        border: 'rgba(0,0,0,0.15)',
        dividers: 'rgba(0,0,0,0.06)',
        background: 'rgba(0,0,0,0.04)',
        tableHeader: 'rgba(0,0,0,0.02)',
        sidebarBackground: '#fff',
    },
    dark: {
        title: 'rgba(255,255,255,0.85)',
        primaryText: 'rgba(255,255,255,0.85)',
        secondaryText: 'rgba(255,255,255,0.45)',
        disable: 'rgba(255,255,255,0.30)',
        border: 'rgba(255,255,255,0.20)',
        dividers: 'rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.08)',
        tableHeader: 'rgba(255,255,255,0.04)',
        sidebarBackground: '#141414',
    },
};

const neutralPalette = {
    light: {
        gray_1: '#ffffff',
        gray_2: '#fafafa',
        gray_3: '#f5f5f5',
        gray_4: '#f0f0f0',
        gray_5: '#d9d9d9',
        gray_6: '#bfbfbf',
        gray_7: '#8c8c8c',
        gray_8: '#595959',
        gray_9: '#434343',
        gray_10: '#262626',
        gray_11: '#1f1f1f',
        gray_12: '#141414',
        gray_13: '#000000',
    },
    dark: {
        gray_13: '#ffffff',
        gray_12: '#fafafa',
        gray_11: '#f5f5f5',
        gray_10: '#f0f0f0',
        gray_9: '#d9d9d9',
        gray_8: '#bfbfbf',
        gray_7: '#8c8c8c',
        gray_6: '#595959',
        gray_5: '#434343',
        gray_4: '#262626',
        gray_3: '#1f1f1f',
        gray_2: '#141414',
        gray_1: '#000000',
    },
};

const primaryPaletteLight = {
    bcp_1: '#f0f5ff',
    bcp_2: '#d6e4ff',
    bcp_3: '#adc6ff',
    bcp_4: '#85a5ff',
    bcp_5: '#5c8dff',
    bcp_6: '#3366ff',
    bcp_7: '#254eda',
    bcp_8: '#1739b5',
    bcp_9: '#102693',
    bcp_10: '#091870',
};

const primaryPaletteDark = {
    bcp_1: '#14182c',
    bcp_2: '#172145',
    bcp_3: '#1d2d5b',
    bcp_4: '#22397e',
    bcp_5: '#2849ad',
    bcp_6: '#2e5adc',
    bcp_7: '#557ee8',
    bcp_8: '#7fa3f3',
    bcp_9: '#a8c5f8',
    bcp_10: '#d2e2fa',
};

const secondaryPaletteLight = {
    bcs_1: '#e6fffb',
    bcs_2: '#b5f5ec',
    bcs_3: '#87e8de',
    bcs_4: '#5cdbd3',
    bcs_5: '#36cfc9',
    bcs_6: '#05BDB1',
    bcs_7: '#08979c',
    bcs_8: '#006d75',
    bcs_9: '#00474f',
    bcs_10: '#002329',
};

const secondaryPaletteDark = {
    bcs_1: '#112222',
    bcs_2: '#0f3533',
    bcs_3: '#104743',
    bcs_4: '#0d605b',
    bcs_5: '#0a827a',
    bcs_6: '#07a499',
    bcs_7: '#24b7a9',
    bcs_8: '#48ccbb',
    bcs_9: '#71ddca',
    bcs_10: '#9eecdc',
};

const errorPaletteLight = {
    ep_1: '#fff2f0',
    ep_2: '#ffccc7',
    ep_3: '#ffa39e',
    ep_4: '#ff7875',
    ep_5: '#ff4d4f',
    ep_6: '#f5222d',
    ep_7: '#cf1322',
    ep_8: '#a8071a',
    ep_9: '#820014',
    ep_10: '#5c0011',
};

const errorPaletteDark = {
    ep_1: '#2c1618',
    ep_2: '#451d1f',
    ep_3: '#5b2526',
    ep_4: '#7e2e2f',
    ep_5: '#ad393a',
    ep_6: '#dc4446',
    ep_7: '#e86e6b',
    ep_8: '#f39c97',
    ep_9: '#f8c6c2',
    ep_10: '#faedec',
};

const warningPaletteLight = {
    wp_1: '#fffbe6',
    wp_2: '#fff1b8',
    wp_3: '#ffe58f',
    wp_4: '#ffd666',
    wp_5: '#ffc53d',
    wp_6: '#faad14',
    wp_7: '#d48806',
    wp_8: '#ad6800',
    wp_9: '#874d00',
    wp_10: '#613400',
};

const warningPaletteDark = {
    wp_1: '#2b2111',
    wp_2: '#443111',
    wp_3: '#594214',
    wp_4: '#7c5914',
    wp_5: '#aa7714',
    wp_6: '#d89614',
    wp_7: '#e8b339',
    wp_8: '#f3cc62',
    wp_9: '#f8df8b',
    wp_10: '#faedb5',
};

const iconColors = {
    light: {
        primary: primaryPaletteLight.bcp_6,
        secondary: secondaryPaletteLight.bcs_2,
    },
    dark: {
        primary: neutralPalette.dark.gray_12,
        secondary: neutralPalette.dark.gray_6,
    },
};

const darkIndex5Values: Record<string, string> = {
    primary: '#2e5adc',
    secondary: '#07a499',
    link: '#2e5adc',
    success: '#49aa19',
    warning: '#d89614',
    error: '#dc4446',
};

export function getPalette({ dark }: { dark?: boolean } = {}): Record<string, unknown> {
    const primaryPalette = dark ? primaryPaletteDark : primaryPaletteLight;
    const secondaryPalette = dark ? secondaryPaletteDark : secondaryPaletteLight;
    const errorPalette = dark ? errorPaletteDark : errorPaletteLight;
    const warningPalette = dark ? warningPaletteDark : warningPaletteLight;

    const colorEntries = Object.entries(colors).map(([name, color]) => [
        name,
        dark ? darkIndex5Values[name] : color,
    ]);

    return {
        ...Object.fromEntries(colorEntries),
        neutral: {
            ...(dark ? neutralColors.dark : neutralColors.light),
        },
        neutralPalette: {
            ...(dark ? neutralPalette.dark : neutralPalette.light),
        },
        iconColors: {
            ...(dark ? iconColors.dark : iconColors.light),
        },
        primaryPalette,
        secondaryPalette,
        errorPalette,
        warningPalette,
    };
}
