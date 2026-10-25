import type { SessionData } from '@adonisjs/session/types';

import {
	PasskeyChallengeService,
	type Ceremony,
} from '#passkeys/passkey_challenge_service';
import { FAKE_CHALLENGE } from '#tests/helpers/fake_webauthn_service';

/**
 * Session values a ceremony's options request would have stored, to hand to
 * `withSession` when testing the verify step alone.
 */
export function buildPendingChallengeSession(ceremony: Ceremony): SessionData {
	const storedValues: SessionData = {};
	const store = {
		put: (key: string, value: SessionData[string]) => {
			storedValues[key] = value;
		},
		pull: () => undefined,
	};
	new PasskeyChallengeService().remember(store, ceremony, FAKE_CHALLENGE);
	return storedValues;
}
