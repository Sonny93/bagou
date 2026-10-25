/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  dictation: {
    showDictation: typeof routes['dictation.show_dictation']
  }
  auth: {
    logout: typeof routes['auth.logout']
    login: typeof routes['auth.login']
  }
  passkeys: {
    createAuthenticationOptions: typeof routes['passkeys.create_authentication_options']
    verifyAuthentication: typeof routes['passkeys.verify_authentication']
    showPasskeyInvitation: typeof routes['passkeys.show_passkey_invitation']
    createInvitationOptions: typeof routes['passkeys.create_invitation_options']
    verifyInvitation: typeof routes['passkeys.verify_invitation']
    showPasskeys: typeof routes['passkeys.show_passkeys']
    createRegistrationOptions: typeof routes['passkeys.create_registration_options']
    verifyRegistration: typeof routes['passkeys.verify_registration']
    deletePasskey: typeof routes['passkeys.delete_passkey']
  }
}
