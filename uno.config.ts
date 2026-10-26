import presetIcons from '@unocss/preset-icons';
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';
import { defineConfig, presetWebFonts, presetWind4 } from 'unocss';

const PETROL_SCALE = {
	50: 'oklch(97.5% .012 212)',
	100: 'oklch(94.5% .028 212)',
	200: 'oklch(89% .05 212)',
	300: 'oklch(81% .08 212)',
	400: 'oklch(71% .105 212)',
	500: 'oklch(60% .11 212)',
	600: 'oklch(51% .1 212)',
	700: 'oklch(44% .088 212)',
	800: 'oklch(37% .072 212)',
	900: 'oklch(31% .058 212)',
	950: 'oklch(22% .04 212)',
};

const FONT_ASSETS_DIR = 'public/fonts';
const FONT_SERVE_BASE_URL = '/fonts';

const BLUE_VARIABLE_SAFELIST = Object.keys(PETROL_SCALE).map(
	(shade) => `colors:blue-${shade}`
);

export default defineConfig({
	presets: [
		presetWind4({ dark: 'class' }),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
			},
		}),
		presetWebFonts({
			provider: 'fontsource',
			fonts: {
				sans: { name: 'Instrument Sans', weights: [400, 500, 600] },
				serif: { name: 'Literata', weights: [400, 500], italic: true },
			},
			processors: createLocalFontProcessor({
				fontAssetsDir: FONT_ASSETS_DIR,
				fontServeBaseUrl: FONT_SERVE_BASE_URL,
			}),
		}),
	],
	safelist: [...BLUE_VARIABLE_SAFELIST, 'font:sans', 'font:serif'],
	theme: {
		colors: {
			canvas: 'var(--color-canvas)',
			surface: 'var(--color-surface)',
			line: 'var(--color-line)',
			ink: 'var(--color-ink)',
			muted: 'var(--color-muted)',
			signal: 'var(--color-signal)',
			accent: PETROL_SCALE,
			/**
			 * `@minimalstuff/ui` paints its primary color with the blue scale through
			 * `--colors-blue-*` variables, so redefining blue re-brands every library
			 * component. The safelist forces those variables out even though our own
			 * code never uses `blue-*` classes.
			 */
			blue: PETROL_SCALE,
		},
	},
});
