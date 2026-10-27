import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { test } from '@japa/runner';

import HttpExceptionHandler from '#exceptions/handler';

async function renderError(error: Error & { status?: number; code?: string }) {
	const context = new HttpContextFactory().create();
	await new HttpExceptionHandler().renderErrorAsJSON(
		{ status: error.status ?? 500, code: error.code, message: error.message },
		context
	);
	return {
		status: context.response.getStatus(),
		body: context.response.getBody(),
	};
}

test.group('HttpExceptionHandler', () => {
	test('should keep the code and message of a client error', async ({
		assert,
	}) => {
		const { status, body } = await renderError(
			Object.assign(new Error('Passkey not found'), {
				status: 404,
				code: 'E_PASSKEY_NOT_FOUND',
			})
		);

		assert.equal(status, 404);
		assert.deepEqual(body, {
			code: 'E_PASSKEY_NOT_FOUND',
			message: 'Passkey not found',
		});
	});

	test('should keep the code but hide the message of a server error', async ({
		assert,
	}) => {
		const { status, body } = await renderError(
			Object.assign(new Error('duplicate key (secret@example.com)'), {
				status: 503,
				code: 'E_TEXT_CLEANUP_UNAVAILABLE',
			})
		);

		assert.equal(status, 503);
		assert.deepEqual(body, {
			code: 'E_TEXT_CLEANUP_UNAVAILABLE',
			message: 'Internal server error',
		});
	});

	test('should answer E_INTERNAL_SERVER_ERROR without the message when an unexpected error has no code', async ({
		assert,
	}) => {
		const { body } = await renderError(
			new Error('relation "users" detail: secret')
		);

		assert.deepEqual(body, {
			code: 'E_INTERNAL_SERVER_ERROR',
			message: 'Internal server error',
		});
	});
});
