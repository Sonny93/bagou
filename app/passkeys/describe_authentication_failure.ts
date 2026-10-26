import MissingPasskeyChallengeException from '#passkeys/missing_passkey_challenge_exception';
import PasskeyAuthenticationFailedException from '#passkeys/passkey_authentication_failed_exception';

/**
 * Coarse, log-safe label of why a login failed: an unknown credential and a
 * failed verification deliberately share one kind, like their response.
 */
export function describeAuthenticationFailure(error: unknown): string {
	if (error instanceof MissingPasskeyChallengeException) {
		return 'missing_challenge';
	}
	if (error instanceof PasskeyAuthenticationFailedException) return 'rejected';
	return 'unexpected';
}
