import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'~': `${import.meta.dirname}/inertia`,
			'@generated': `${import.meta.dirname}/.adonisjs/client`,
		},
	},
	test: {
		include: ['inertia/**/*.spec.ts'],
		environment: 'node',
	},
});
