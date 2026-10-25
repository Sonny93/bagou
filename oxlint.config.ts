import { minimalstuffPreset } from '@minimalstuff/tooling/oxc/lint';

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
	],
});
