import adonisjs from '@adonisjs/vite/client';
import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

import { APP_VERSION_DEFINE } from './vite_app_version_define.ts';

export default defineConfig({
	define: APP_VERSION_DEFINE,

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
