import { test } from '@japa/runner';

test.group('ShowDictationController', () => {
	test('should render the dictation page when visiting the home route', async ({
		client,
	}) => {
		const response = await client.get('/').withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('dictation/show_dictation');
	});
});
