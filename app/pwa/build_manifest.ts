export const MANIFEST_LANGUAGES = ['en', 'fr'] as const;

export type ManifestLanguage = (typeof MANIFEST_LANGUAGES)[number];

type ManifestNames = {
	name: string;
	short_name: string;
};

// These two names are the only server-side translations: the browser reads the manifest outside the app.
const MANIFEST_NAMES = {
	en: { name: 'Voice dictation', short_name: 'Dictation' },
	fr: { name: 'Dictée vocale', short_name: 'Dictée' },
} as const satisfies Record<ManifestLanguage, ManifestNames>;

const MANIFEST_BACKGROUND_COLOR = '#f3f6f8';

export function buildManifest(language: ManifestLanguage) {
	return {
		...MANIFEST_NAMES[language],
		lang: language,
		start_url: '/',
		scope: '/',
		display: 'standalone',
		background_color: MANIFEST_BACKGROUND_COLOR,
		theme_color: MANIFEST_BACKGROUND_COLOR,
		launch_handler: { client_mode: 'navigate-existing' },
		icons: [
			{
				src: '/icons/icon-192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-maskable-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	};
}
