import { test } from '@japa/runner';
import { mock } from 'node:test';

import {
	CEREMONIES,
	CHALLENGE_TTL_MS,
	PasskeyChallengeService,
	type ChallengeStore,
} from '#passkeys/passkey_challenge_service';

class InMemoryChallengeStore implements ChallengeStore {
	private readonly values = new Map<string, unknown>();

	put(key: string, value: unknown): void {
		this.values.set(key, value);
	}

	pull(key: string): unknown {
		const value = this.values.get(key);
		this.values.delete(key);
		return value;
	}
}

test.group('PasskeyChallengeService', (group) => {
	const NOW_MS = 1_700_000_000_000;

	group.each.setup(() => {
		mock.timers.enable({ apis: ['Date'], now: NOW_MS });
		return () => mock.timers.reset();
	});

	test('should return the remembered challenge once', ({ assert }) => {
		const service = new PasskeyChallengeService();
		const store = new InMemoryChallengeStore();
		service.remember(store, CEREMONIES.registration, 'challenge-1');

		const challenge = service.consume(store, CEREMONIES.registration);

		assert.equal(challenge, 'challenge-1');
		assert.throws(
			() => service.consume(store, CEREMONIES.registration),
			/expired/
		);
	});

	test('should keep one pending challenge per ceremony', ({ assert }) => {
		const service = new PasskeyChallengeService();
		const store = new InMemoryChallengeStore();
		service.remember(store, CEREMONIES.registration, 'registration-challenge');
		service.remember(
			store,
			CEREMONIES.authentication,
			'authentication-challenge'
		);

		assert.equal(
			service.consume(store, CEREMONIES.authentication),
			'authentication-challenge'
		);
		assert.equal(
			service.consume(store, CEREMONIES.registration),
			'registration-challenge'
		);
	});

	test('should reject a challenge older than its time to live', ({
		assert,
	}) => {
		const service = new PasskeyChallengeService();
		const store = new InMemoryChallengeStore();
		service.remember(store, CEREMONIES.authentication, 'challenge-1');

		mock.timers.tick(CHALLENGE_TTL_MS);

		assert.throws(
			() => service.consume(store, CEREMONIES.authentication),
			/expired/
		);
	});

	test('should reject a malformed session value', ({ assert }) => {
		const service = new PasskeyChallengeService();
		const store = new InMemoryChallengeStore();
		store.put('passkeys.challenge.registration', 'not-an-object');

		assert.throws(
			() => service.consume(store, CEREMONIES.registration),
			/expired/
		);
	});
});
