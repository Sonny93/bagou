import { linguiMacroSwcPlugin } from '@lingui/swc-plugin/options';
import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

import { APP_VERSION_DEFINE } from './vite_app_version_define.ts';

export default defineConfig({
	define: APP_VERSION_DEFINE,
	plugins: [react({ plugins: [linguiMacroSwcPlugin()] }), lingui()],
	resolve: {
		alias: {
			'~': `${import.meta.dirname}/inertia`,
			'@generated': `${import.meta.dirname}/.adonisjs/client`,
		},
	},
	test: {
		include: ['inertia/**/*.spec.ts'],
		environment: 'node',
		setupFiles: ['./inertia/test_setup.ts'],
	},
});
