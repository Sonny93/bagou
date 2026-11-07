/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse, Method, PathWithRegistry, PatternsByMethod, RouteWithRegistry } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'
import type { routes } from './index.ts'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'dictation.show_dictation': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/dictation/show_dictation_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/dictation/show_dictation_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/dictation/show_dictation_controller').default['render']>>>
    }
  }
  'transcription_history.show_transcripts': {
    methods: ["GET","HEAD"]
    pattern: '/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#transcription_history/validators/show_transcripts_validator').showTranscriptsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/show_transcripts_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/show_transcripts_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/show_transcripts_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transcription_history.delete_transcript': {
    methods: ["DELETE"]
    pattern: '/history/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcript_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcript_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcript_controller').default['execute']>>>
    }
  }
  'transcription_history.clean_transcript': {
    methods: ["POST"]
    pattern: '/history/:id/clean'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/clean_transcript_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/clean_transcript_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/clean_transcript_controller').default['execute']>>>
    }
  }
  'transcription_history.reclean_transcript': {
    methods: ["POST"]
    pattern: '/history/:id/reclean'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transcription_history/validators/reclean_transcript_validator').recleanTranscriptValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transcription_history/validators/reclean_transcript_validator').recleanTranscriptValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/reclean_transcript_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/reclean_transcript_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/reclean_transcript_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transcription_history.save_draft_text': {
    methods: ["PUT"]
    pattern: '/history/drafts/:draftId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transcription_history/validators/save_draft_text_validator').saveDraftTextValidator)>>
      paramsTuple: [ParamValue]
      params: { draftId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transcription_history/validators/save_draft_text_validator').saveDraftTextValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/save_draft_text_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/save_draft_text_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/save_draft_text_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transcription_history.clean_draft': {
    methods: ["POST"]
    pattern: '/history/drafts/:draftId/clean'
    types: {
      body: ExtractBody<InferInput<(typeof import('#transcription_history/validators/clean_draft_validator').cleanDraftValidator)>>
      paramsTuple: [ParamValue]
      params: { draftId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#transcription_history/validators/clean_draft_validator').cleanDraftValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/clean_draft_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/clean_draft_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/clean_draft_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'transcription_history.delete_transcripts': {
    methods: ["DELETE"]
    pattern: '/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcripts_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcripts_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/transcription_history/delete_transcripts_controller').default['execute']>>>
    }
  }
  'user_settings.show_settings': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/user_settings/show_settings_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/user_settings/show_settings_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/user_settings/show_settings_controller').default['render']>>>
    }
  }
  'user_settings.update_settings': {
    methods: ["PUT"]
    pattern: '/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#user_settings/validators/update_settings_validator').updateSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#user_settings/validators/update_settings_validator').updateSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/user_settings/update_settings_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/user_settings/update_settings_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/user_settings/update_settings_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user_settings.preview_cleanup': {
    methods: ["POST"]
    pattern: '/settings/preview'
    types: {
      body: ExtractBody<InferInput<(typeof import('#user_settings/validators/preview_cleanup_validator').previewCleanupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#user_settings/validators/preview_cleanup_validator').previewCleanupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/user_settings/preview_cleanup_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/user_settings/preview_cleanup_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/user_settings/preview_cleanup_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'corrections.add_correction': {
    methods: ["POST"]
    pattern: '/corrections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#corrections/validators/add_correction_validator').addCorrectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#corrections/validators/add_correction_validator').addCorrectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/corrections/add_correction_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/corrections/add_correction_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/corrections/add_correction_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'corrections.delete_correction': {
    methods: ["DELETE"]
    pattern: '/corrections/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/corrections/delete_correction_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/corrections/delete_correction_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/corrections/delete_correction_controller').default['execute']>>>
    }
  }
  'changelog.show_changelog': {
    methods: ["GET","HEAD"]
    pattern: '/changelog'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/changelog/show_changelog_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/changelog/show_changelog_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/changelog/show_changelog_controller').default['render']>>>
    }
  }
  'changelog.mark_changelog_seen': {
    methods: ["POST"]
    pattern: '/changelog/seen'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/changelog/mark_changelog_seen_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/changelog/mark_changelog_seen_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/changelog/mark_changelog_seen_controller').default['execute']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/logout_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/logout_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/auth/logout_controller').default['execute']>>>
    }
  }
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/show_login_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/show_login_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/show_login_controller').default['render']>>>
    }
  }
  'passkeys.create_authentication_options': {
    methods: ["POST"]
    pattern: '/passkeys/authentication/options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/create_authentication_options_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/create_authentication_options_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/create_authentication_options_controller').default['execute']>>>
    }
  }
  'passkeys.verify_authentication': {
    methods: ["POST"]
    pattern: '/passkeys/authentication/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#passkeys/validators/verify_authentication_validator').verifyAuthenticationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#passkeys/validators/verify_authentication_validator').verifyAuthenticationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/verify_authentication_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/verify_authentication_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/verify_authentication_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'passkeys.show_passkey_invitation': {
    methods: ["GET","HEAD"]
    pattern: '/passkeys/invitations/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/show_passkey_invitation_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/show_passkey_invitation_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/show_passkey_invitation_controller').default['render']>>>
    }
  }
  'passkeys.create_invitation_options': {
    methods: ["POST"]
    pattern: '/passkeys/invitations/:token/options'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/create_invitation_options_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/create_invitation_options_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/create_invitation_options_controller').default['execute']>>>
    }
  }
  'passkeys.verify_invitation': {
    methods: ["POST"]
    pattern: '/passkeys/invitations/:token/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#passkeys/validators/verify_registration_validator').verifyRegistrationValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#passkeys/validators/verify_registration_validator').verifyRegistrationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/verify_invitation_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/verify_invitation_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/verify_invitation_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'passkeys.show_passkeys': {
    methods: ["GET","HEAD"]
    pattern: '/passkeys'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/show_passkeys_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/show_passkeys_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/show_passkeys_controller').default['render']>>>
    }
  }
  'passkeys.create_registration_options': {
    methods: ["POST"]
    pattern: '/passkeys/registration/options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/create_registration_options_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/create_registration_options_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/create_registration_options_controller').default['execute']>>>
    }
  }
  'passkeys.verify_registration': {
    methods: ["POST"]
    pattern: '/passkeys/registration/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#passkeys/validators/verify_registration_validator').verifyRegistrationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#passkeys/validators/verify_registration_validator').verifyRegistrationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/verify_registration_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/verify_registration_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/verify_registration_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'passkeys.delete_passkey': {
    methods: ["DELETE"]
    pattern: '/passkeys/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/passkeys/delete_passkey_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/passkeys/delete_passkey_controller').default['execute']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/passkeys/delete_passkey_controller').default['execute']>>>
    }
  }
}

export namespace Route {
  export type Request<Name extends keyof typeof routes> = RouteWithRegistry.Request<typeof routes, Name>
  export type Response<Name extends keyof typeof routes> = RouteWithRegistry.Response<typeof routes, Name>
  export type Params<Name extends keyof typeof routes> = RouteWithRegistry.Params<typeof routes, Name>
  export type Body<Name extends keyof typeof routes> = RouteWithRegistry.Body<typeof routes, Name>
  export type Query<Name extends keyof typeof routes> = RouteWithRegistry.Query<typeof routes, Name>
  export type Error<Name extends keyof typeof routes> = RouteWithRegistry.Error<typeof routes, Name>
}

export namespace Path {
  export type Request<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Request<typeof routes, M, P>
  export type Response<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Response<typeof routes, M, P>
  export type Params<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Params<typeof routes, M, P>
  export type Body<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Body<typeof routes, M, P>
  export type Query<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Query<typeof routes, M, P>
  export type Error<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Error<typeof routes, M, P>
}
