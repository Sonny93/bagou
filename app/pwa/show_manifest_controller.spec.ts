import { test } from '@japa/runner';

test.group('ShowManifestController', () => {
	test('should serve the French manifest when the browser prefers French', async ({
		client,
		assert,
	}) => {
		const response = await client
			.get('/manifest.webmanifest')
			.header('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');

		response.assertStatus(200);
		response.assertHeader('content-type', 'application/manifest+json');
		assert.include(response.body(), {
			name: 'Dictée vocale',
			short_name: 'Dictée',
			lang: 'fr',
		});
	});

	test('should serve the English manifest when the browser prefers English', async ({
		client,
		assert,
	}) => {
		const response = await client
			.get('/manifest.webmanifest')
			.header('Accept-Language', 'en-US,en;q=0.9');

		response.assertStatus(200);
		assert.include(response.body(), {
			name: 'Voice dictation',
			short_name: 'Dictation',
			lang: 'en',
		});
	});

	test('should fall back to English when the browser language is not supported', async ({
		client,
		assert,
	}) => {
		const response = await client
			.get('/manifest.webmanifest')
			.header('Accept-Language', 'de-DE');

		assert.equal(response.body().lang, 'en');
	});

	test('should serve the manifest to a guest', async ({ client }) => {
		const response = await client.get('/manifest.webmanifest');

		response.assertStatus(200);
	});
});
