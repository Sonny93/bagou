import { test } from '@japa/runner';

import { describeErrorForLog } from '#dictation/describe_error_for_log';

test.group('describeErrorForLog', () => {
	test('should keep only the name and the string code of an error', ({
		assert,
	}) => {
		const error = Object.assign(new Error('texte secret'), {
			code: '23505',
			detail: 'Failing row contains (texte secret)',
		});

		assert.deepEqual(describeErrorForLog(error), {
			errorName: 'Error',
			errorCode: '23505',
		});
	});

	test('should omit a code that is not a string', ({ assert }) => {
		const error = Object.assign(new Error('boom'), { code: 42 });

		assert.deepEqual(describeErrorForLog(error), { errorName: 'Error' });
	});

	test('should name a thrown value that is not an error', ({ assert }) => {
		assert.deepEqual(describeErrorForLog('texte secret'), {
			errorName: 'UnknownError',
		});
	});
});
