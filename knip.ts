import { minimalstuffPreset } from '@minimalstuff/tooling/knip';

export default minimalstuffPreset({
	adonisjs: true,
	entry: ['lingui.config.ts'],
	ignore: ['public/sw.js'],
	ignoreDependencies: ['@iconify-json/tabler'],
});
