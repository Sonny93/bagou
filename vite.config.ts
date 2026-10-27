import adonisjs from '@adonisjs/vite/client';
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		react({ plugins: [linguiMacroSwcPlugin()] }),
		lingui(),
		UnoCSS(),
		adonisjs({
			entryPoints: ['inertia/app.tsx'],
			reload: ['resources/views/**/*.edge'],
		}),
	],

	resolve: {
		alias: {
			'~/': `${import.meta.dirname}/inertia/`,
			'@generated': `${import.meta.dirname}/.adonisjs/client/`,
		},
	},
});
