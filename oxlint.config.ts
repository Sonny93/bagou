import { minimalstuffPreset } from '@minimalstuff/tooling/oxc/lint';

const DICTATION_CORE_REUSE_REASON =
	'The dictation core is reused by a future Tauri app:';

export default minimalstuffPreset({
	adonisjs: true,
	react: true,
	vitest: true,
	overrides: [
		{
			files: ['**/app/**/*.ts'],
			rules: {
				'typescript/consistent-type-imports': 'off',
			},
		},
		{
			files: ['**/inertia/dictation/core/**/*.ts'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: ['@inertiajs/*'],
								message: `${DICTATION_CORE_REUSE_REASON} no Inertia import.`,
							},
							{
								group: ['@adonisjs/*'],
								message: `${DICTATION_CORE_REUSE_REASON} no Adonis import.`,
							},
							{
								regex: '^#',
								message: `${DICTATION_CORE_REUSE_REASON} no server import.`,
							},
							{
								group: ['~/**'],
								message: `${DICTATION_CORE_REUSE_REASON} no import from the rest of the web app.`,
							},
							{
								group: ['../**'],
								message: `${DICTATION_CORE_REUSE_REASON} only import siblings from inside this folder.`,
							},
							{
								group: ['@generated/*'],
								allowTypeImports: true,
								message: `${DICTATION_CORE_REUSE_REASON} only type imports from generated code.`,
							},
						],
					},
				],
			},
		},
	],
});
