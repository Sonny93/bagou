/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  dictation: {
    showDictation: typeof routes['dictation.show_dictation']
  }
  transcriptionHistory: {
    showTranscripts: typeof routes['transcription_history.show_transcripts']
    deleteTranscript: typeof routes['transcription_history.delete_transcript']
    cleanTranscript: typeof routes['transcription_history.clean_transcript']
    saveDraftText: typeof routes['transcription_history.save_draft_text']
    cleanDraft: typeof routes['transcription_history.clean_draft']
    deleteTranscripts: typeof routes['transcription_history.delete_transcripts']
  }
  userSettings: {
    showSettings: typeof routes['user_settings.show_settings']
    updateSettings: typeof routes['user_settings.update_settings']
    previewCleanup: typeof routes['user_settings.preview_cleanup']
  }
  corrections: {
    addCorrection: typeof routes['corrections.add_correction']
    deleteCorrection: typeof routes['corrections.delete_correction']
  }
  changelog: {
    showChangelog: typeof routes['changelog.show_changelog']
    markChangelogSeen: typeof routes['changelog.mark_changelog_seen']
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
