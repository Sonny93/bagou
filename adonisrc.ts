import { indexEntities } from '@adonisjs/core';
import { defineConfig } from '@adonisjs/core/app';
import { indexPages } from '@adonisjs/inertia';
import { generateRegistry } from '@tuyau/core/hooks';

const DOMAINS = ['auth', 'dictation', 'passkeys', 'users'];

export default defineConfig({
	commands: [
		() => import('@adonisjs/core/commands'),
		() => import('@adonisjs/lucid/commands'),
	],

	providers: [
		() => import('@adonisjs/core/providers/app_provider'),
		{
			file: () => import('@adonisjs/core/providers/repl_provider'),
			environment: ['repl', 'test'],
		},
		() => import('@adonisjs/core/providers/vinejs_provider'),
		() => import('@adonisjs/core/providers/edge_provider'),
		() => import('@adonisjs/session/session_provider'),
		() => import('@adonisjs/vite/vite_provider'),
		() => import('@adonisjs/shield/shield_provider'),
		() => import('@adonisjs/static/static_provider'),
		() => import('@adonisjs/cors/cors_provider'),
		() => import('@adonisjs/lucid/database_provider'),
		() => import('@adonisjs/auth/auth_provider'),
		() => import('@adonisjs/inertia/inertia_provider'),
	],

	preloads: [
		() => import('#start/routes'),
		() => import('#start/kernel'),
		() => import('#start/validator'),
		() => import('#start/passkey_routes'),
	],

	tests: {
		suites: [
			{
				// No HTTP server. Role-based globs, disjoint from the functional suite by construction.
				files: [
					'app/**/*_service.spec.ts',
					'app/**/*_transformer.spec.ts',
					'app/**/validators/**/*.spec.ts',
					'app/**/*_command.spec.ts',
				],
				name: 'unit',
				timeout: 2000,
			},
			{
				// Boots the HTTP server and exercises real routes end to end.
				files: [
					'app/**/*_controller.spec.ts',
					'app/**/*_channel.spec.ts',
					'app/exceptions/**/*.spec.ts',
					'app/middleware/**/*.spec.ts',
				],
				name: 'functional',
				timeout: 30000,
			},
		],
		forceExit: true,
	},

	metaFiles: [
		{
			pattern: 'resources/views/**/*.edge',
			reloadServer: false,
		},
		{
			pattern: 'public/**',
			reloadServer: false,
		},
	],

	hooks: {
		init: [
			indexEntities({
				controllers: {
					source: 'app',
					glob: ['**/*_controller.ts'],
					importAlias: '#app',
				},
				transformers: {
					enabled: true,
					withSharedProps: true,
					source: 'app',
					glob: ['**/*_transformer.ts'],
					importAlias: undefined,
					skipSegments: DOMAINS,
				},
			}),
			indexPages({ framework: 'react' }),
			generateRegistry(),
		],
		buildStarting: [() => import('@adonisjs/vite/build_hook')],
	},
});
