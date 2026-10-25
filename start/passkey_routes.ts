import router from '@adonisjs/core/services/router';

import { controllers } from '#generated/controllers';
import { middleware } from '#start/kernel';

/**
 * Passkey (WebAuthn) authentication. This file and `app/passkeys/` are the
 * only place that knows about passkeys: the rest of the app depends on the
 * Adonis session guard (`auth.use('web')`), the `User` model and the route
 * named `auth.login`.
 *
 * Replacing passkeys by another login method (OIDC...) means replacing this
 * file and `app/passkeys/` with a domain that registers a guest route named
 * `auth.login` and ends successful flows with `auth.use('web').login(user)`.
 */
router
	.group(() => {
		router
			.get('/login', [controllers.passkeys.ShowLogin, 'render'])
			.as('auth.login');
		router
			.post('/passkeys/authentication/options', [
				controllers.passkeys.CreateAuthenticationOptions,
				'execute',
			])
			.as('passkeys.create_authentication_options');
		router
			.post('/passkeys/authentication/verify', [
				controllers.passkeys.VerifyAuthentication,
				'execute',
			])
			.as('passkeys.verify_authentication');
		router
			.get('/passkeys/invitations/:token', [
				controllers.passkeys.ShowPasskeyInvitation,
				'render',
			])
			.as('passkeys.show_passkey_invitation');
		router
			.post('/passkeys/invitations/:token/options', [
				controllers.passkeys.CreateInvitationOptions,
				'execute',
			])
			.as('passkeys.create_invitation_options');
		router
			.post('/passkeys/invitations/:token/verify', [
				controllers.passkeys.VerifyInvitation,
				'execute',
			])
			.as('passkeys.verify_invitation');
	})
	.middleware([middleware.guest()]);

router
	.group(() => {
		router
			.get('/passkeys', [controllers.passkeys.ShowPasskeys, 'render'])
			.as('passkeys.show_passkeys');
		router
			.post('/passkeys/registration/options', [
				controllers.passkeys.CreateRegistrationOptions,
				'execute',
			])
			.as('passkeys.create_registration_options');
		router
			.post('/passkeys/registration/verify', [
				controllers.passkeys.VerifyRegistration,
				'execute',
			])
			.as('passkeys.verify_registration');
		router
			.delete('/passkeys/:id', [controllers.passkeys.DeletePasskey, 'execute'])
			.as('passkeys.delete_passkey');
	})
	.middleware([middleware.auth()]);
