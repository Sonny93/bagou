import { inject } from '@adonisjs/core';
import type { Session } from '@adonisjs/session';

import MissingPasskeyChallengeException from '#passkeys/missing_passkey_challenge_exception';

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export const CEREMONIES = {
	registration: 'registration',
	authentication: 'authentication',
} as const;

export type Ceremony = (typeof CEREMONIES)[keyof typeof CEREMONIES];

export type ChallengeStore = Pick<Session, 'put' | 'pull'>;

type PendingChallenge = {
	challenge: string;
	expiresAt: number;
};

const sessionKeyFor = (ceremony: Ceremony): string =>
	`passkeys.challenge.${ceremony}`;

const isPendingChallenge = (value: unknown): value is PendingChallenge =>
	typeof value === 'object' &&
	value !== null &&
	'challenge' in value &&
	typeof value.challenge === 'string' &&
	'expiresAt' in value &&
	typeof value.expiresAt === 'number';

/**
 * Keeps at most one pending challenge per ceremony type in the session. A
 * challenge is single-use: reading it removes it, expired or not.
 */
@inject()
export class PasskeyChallengeService {
	remember(store: ChallengeStore, ceremony: Ceremony, challenge: string): void {
		const pendingChallenge: PendingChallenge = {
			challenge,
			expiresAt: Date.now() + CHALLENGE_TTL_MS,
		};
		store.put(sessionKeyFor(ceremony), pendingChallenge);
	}

	consume(store: ChallengeStore, ceremony: Ceremony): string {
		const pendingChallenge: unknown = store.pull(sessionKeyFor(ceremony));
		if (!isPendingChallenge(pendingChallenge)) {
			throw new MissingPasskeyChallengeException();
		}
		if (pendingChallenge.expiresAt <= Date.now()) {
			throw new MissingPasskeyChallengeException();
		}
		return pendingChallenge.challenge;
	}
}
