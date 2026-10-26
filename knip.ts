import { minimalstuffPreset } from '@minimalstuff/tooling/knip';

export default minimalstuffPreset({
	adonisjs: true,
	ignore: ['public/sw.js'],
	ignoreDependencies: ['@iconify-json/tabler'],
});
