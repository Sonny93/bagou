import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';

import Passkey from '#passkeys/passkey';
import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';
import env from '#start/env';
import { BrowserSession } from '#tests/helpers/browser_session';
import { SoftwareAuthenticator } from '#tests/helpers/software_authenticator';

const appUrl = new URL(env.get('APP_URL'));

type AssertionFactory = (
	options: PublicKeyCredentialRequestOptionsJSON
) => AuthenticationResponseJSON;

const buildAuthenticator = () =>
	new SoftwareAuthenticator({ origin: appUrl.origin, rpId: appUrl.hostname });

const isLoggedIn = async (browser: BrowserSession): Promise<boolean> =>
	(await browser.get('/')).status === 200;

async function registerThroughInvitation(
	browser: BrowserSession,
	authenticator: SoftwareAuthenticator
) {
	const { token } = await new PasskeyInvitationService().create();
	const invitationUrl = `/passkeys/invitations/${token}`;
	await browser.get(invitationUrl);
	const optionsResponse = await browser.postJson(`${invitationUrl}/options`);
	return browser.postJson(`${invitationUrl}/verify`, {
		label: 'Software authenticator',
		response: authenticator.createCredential(
			optionsResponse.body as PublicKeyCredentialCreationOptionsJSON
		),
	});
}

async function logOut(browser: BrowserSession) {
	const logoutResponse = await browser.post('/logout');
	await browser.get('/login');
	return logoutResponse;
}

async function requestAuthenticationOptions(browser: BrowserSession) {
	const response = await browser.postJson('/passkeys/authentication/options');
	return response.body as PublicKeyCredentialRequestOptionsJSON;
}

async function signInWith(
	browser: BrowserSession,
	createAssertion: AssertionFactory
) {
	const options = await requestAuthenticationOptions(browser);
	return browser.postJson('/passkeys/authentication/verify', {
		response: createAssertion(options),
	});
}

async function registerAndLogOut(
	browser: BrowserSession,
	authenticator: SoftwareAuthenticator
) {
	await browser.get('/login');
	await registerThroughInvitation(browser, authenticator);
	await logOut(browser);
}

test.group('Passkey ceremonies with the real WebAuthn service', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should register with an invitation, log out, then sign in with the passkey', async ({
		assert,
	}) => {
		const browser = new BrowserSession();
		const authenticator = buildAuthenticator();
		await browser.get('/login');

		const registrationResponse = await registerThroughInvitation(
			browser,
			authenticator
		);

		assert.equal(registrationResponse.status, 200);
		assert.isTrue(await isLoggedIn(browser));
		const passkey = await Passkey.firstOrFail();
		assert.equal(passkey.credentialId, authenticator.credentialIdBase64Url);
		assert.equal(passkey.counter, 0);

		const logoutResponse = await logOut(browser);
		assert.equal(logoutResponse.status, 302);
		assert.equal(logoutResponse.location, '/login');
		assert.isFalse(await isLoggedIn(browser));

		const signInResponse = await signInWith(browser, (options) =>
			authenticator.createAssertion(options)
		);

		assert.equal(signInResponse.status, 200);
		assert.isTrue(await isLoggedIn(browser));
		await passkey.refresh();
		assert.equal(passkey.counter, 1);
		assert.isNotNull(passkey.lastUsedAt);
	});

	test('should reject an assertion made without user verification', async ({
		assert,
	}) => {
		const browser = new BrowserSession();
		const authenticator = buildAuthenticator();
		await registerAndLogOut(browser, authenticator);

		const response = await signInWith(browser, (options) =>
			authenticator.createAssertion(options, { isUserVerified: false })
		);

		assert.equal(response.status, 401);
		assert.isFalse(await isLoggedIn(browser));
	});

	test('should reject a replayed assertion because its challenge was already used', async ({
		assert,
	}) => {
		const browser = new BrowserSession();
		const authenticator = buildAuthenticator();
		await registerAndLogOut(browser, authenticator);
		const options = await requestAuthenticationOptions(browser);
		const body = { response: authenticator.createAssertion(options) };
		const firstResponse = await browser.postJson(
			'/passkeys/authentication/verify',
			body
		);
		assert.equal(firstResponse.status, 200);
		await logOut(browser);

		const replayResponse = await browser.postJson(
			'/passkeys/authentication/verify',
			body
		);

		assert.equal(replayResponse.status, 400);
		assert.isFalse(await isLoggedIn(browser));
	});

	test('should reject an assertion whose counter did not increase', async ({
		assert,
	}) => {
		const browser = new BrowserSession();
		const authenticator = buildAuthenticator();
		await registerAndLogOut(browser, authenticator);
		const firstResponse = await signInWith(browser, (options) =>
			authenticator.createAssertion(options)
		);
		assert.equal(firstResponse.status, 200);
		await logOut(browser);

		const response = await signInWith(browser, (options) =>
			authenticator.createAssertion(options, { counter: 1 })
		);

		assert.equal(response.status, 401);
		assert.equal((await Passkey.firstOrFail()).counter, 1);
	});
});
