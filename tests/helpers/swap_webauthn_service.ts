import app from '@adonisjs/core/services/app';

import { WebauthnService } from '#passkeys/webauthn_service';
import { FakeWebauthnService } from '#tests/helpers/fake_webauthn_service';

/**
 * Replaces the WebAuthn service for one test and returns the function that
 * restores the real one, meant for the test's `cleanup`.
 */
export function swapWebauthnService(
	isVerificationSuccessful: boolean
): () => void {
	app.container.swap(
		WebauthnService,
		() => new FakeWebauthnService({ isVerificationSuccessful })
	);
	return () => app.container.restore(WebauthnService);
}
