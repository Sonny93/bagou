import { test } from '@japa/runner';

import { buildManifest } from '#pwa/build_manifest';

test.group('buildManifest', () => {
	test('should name the app in English', ({ assert }) => {
		const manifest = buildManifest('en');

		assert.include(manifest, {
			name: 'Voice dictation',
			short_name: 'Dictation',
			lang: 'en',
		});
	});

	test('should name the app in French', ({ assert }) => {
		const manifest = buildManifest('fr');

		assert.include(manifest, {
			name: 'Dictée vocale',
			short_name: 'Dictée',
			lang: 'fr',
		});
	});

	test('should keep the same install fields in both languages', ({
		assert,
	}) => {
		const withoutNames = (language: 'en' | 'fr') => ({
			...buildManifest(language),
			name: '',
			short_name: '',
			lang: '',
		});

		assert.deepEqual(withoutNames('en'), withoutNames('fr'));
	});
});
