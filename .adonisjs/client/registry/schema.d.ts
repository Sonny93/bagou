/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

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
  'text_cleanup.clean_text': {
    methods: ["POST"]
    pattern: '/dictation/cleanup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#text_cleanup/validators/clean_text_validator').cleanTextValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#text_cleanup/validators/clean_text_validator').cleanTextValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/text_cleanup/clean_text_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/text_cleanup/clean_text_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#app/text_cleanup/clean_text_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
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
