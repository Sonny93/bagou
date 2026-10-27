import packageJson from './package.json' with { type: 'json' };

export const APP_VERSION_DEFINE = {
	__APP_VERSION__: JSON.stringify(packageJson.version),
};
