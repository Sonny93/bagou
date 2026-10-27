/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'pwa.show_manifest': {
    methods: ["GET","HEAD"]
    pattern: '/manifest.webmanifest'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/pwa/show_manifest_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/pwa/show_manifest_controller').default['render']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/pwa/show_manifest_controller').default['render']>>>
    }
  }
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
