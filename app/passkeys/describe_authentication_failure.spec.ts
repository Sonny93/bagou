import { test } from '@japa/runner';

import { describeAuthenticationFailure } from '#passkeys/describe_authentication_failure';
import MissingPasskeyChallengeException from '#passkeys/missing_passkey_challenge_exception';
import PasskeyAuthenticationFailedException from '#passkeys/passkey_authentication_failed_exception';

test.group('describeAuthenticationFailure', () => {
	test('should label an expired or absent challenge as missing_challenge', ({
		assert,
	}) => {
		assert.equal(
			describeAuthenticationFailure(new MissingPasskeyChallengeException()),
			'missing_challenge'
		);
	});

	test('should label an unknown credential or failed verification as rejected', ({
		assert,
	}) => {
		assert.equal(
			describeAuthenticationFailure(new PasskeyAuthenticationFailedException()),
			'rejected'
		);
	});

	test('should label anything else as unexpected', ({ assert }) => {
		assert.equal(
			describeAuthenticationFailure(new Error('boom')),
			'unexpected'
		);
	});
});
