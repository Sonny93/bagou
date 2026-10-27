import { defineConfig } from '@lingui/cli';

export default defineConfig({
	sourceLocale: 'en',
	locales: ['en', 'fr'],
	catalogs: [
		{
			path: '<rootDir>/inertia/locales/{locale}/messages',
			include: ['<rootDir>/inertia'],
			exclude: ['**/*.spec.ts', '**/*.spec.tsx'],
		},
	],
});
