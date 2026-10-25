import { defineConfig } from '@adonisjs/inertia';

const inertiaConfig = defineConfig({
	rootView: 'inertia_layout',
	encryptHistory: true,
	ssr: {
		enabled: false,
	},
});

export default inertiaConfig;
