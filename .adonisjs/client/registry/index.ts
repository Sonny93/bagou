/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'dictation.show_dictation': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['dictation.show_dictation']['types'],
  },
  'transcription_history.show_transcripts': {
    methods: ["GET","HEAD"],
    pattern: '/history',
    tokens: [[0,"history"]],
    types: placeholder as Registry['transcription_history.show_transcripts']['types'],
  },
  'transcription_history.delete_transcript': {
    methods: ["DELETE"],
    pattern: '/history/:id',
    tokens: [[0,"history"],[1,"id"]],
    types: placeholder as Registry['transcription_history.delete_transcript']['types'],
  },
  'transcription_history.delete_transcripts': {
    methods: ["DELETE"],
    pattern: '/history',
    tokens: [[0,"history"]],
    types: placeholder as Registry['transcription_history.delete_transcripts']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['auth.login']['types'],
  },
  'passkeys.create_authentication_options': {
    methods: ["POST"],
    pattern: '/passkeys/authentication/options',
    tokens: [[0,"passkeys"],[0,"authentication"],[0,"options"]],
    types: placeholder as Registry['passkeys.create_authentication_options']['types'],
  },
  'passkeys.verify_authentication': {
    methods: ["POST"],
    pattern: '/passkeys/authentication/verify',
    tokens: [[0,"passkeys"],[0,"authentication"],[0,"verify"]],
    types: placeholder as Registry['passkeys.verify_authentication']['types'],
  },
  'passkeys.show_passkey_invitation': {
    methods: ["GET","HEAD"],
    pattern: '/passkeys/invitations/:token',
    tokens: [[0,"passkeys"],[0,"invitations"],[1,"token"]],
    types: placeholder as Registry['passkeys.show_passkey_invitation']['types'],
  },
  'passkeys.create_invitation_options': {
    methods: ["POST"],
    pattern: '/passkeys/invitations/:token/options',
    tokens: [[0,"passkeys"],[0,"invitations"],[1,"token"],[0,"options"]],
    types: placeholder as Registry['passkeys.create_invitation_options']['types'],
  },
  'passkeys.verify_invitation': {
    methods: ["POST"],
    pattern: '/passkeys/invitations/:token/verify',
    tokens: [[0,"passkeys"],[0,"invitations"],[1,"token"],[0,"verify"]],
    types: placeholder as Registry['passkeys.verify_invitation']['types'],
  },
  'passkeys.show_passkeys': {
    methods: ["GET","HEAD"],
    pattern: '/passkeys',
    tokens: [[0,"passkeys"]],
    types: placeholder as Registry['passkeys.show_passkeys']['types'],
  },
  'passkeys.create_registration_options': {
    methods: ["POST"],
    pattern: '/passkeys/registration/options',
    tokens: [[0,"passkeys"],[0,"registration"],[0,"options"]],
    types: placeholder as Registry['passkeys.create_registration_options']['types'],
  },
  'passkeys.verify_registration': {
    methods: ["POST"],
    pattern: '/passkeys/registration/verify',
    tokens: [[0,"passkeys"],[0,"registration"],[0,"verify"]],
    types: placeholder as Registry['passkeys.verify_registration']['types'],
  },
  'passkeys.delete_passkey': {
    methods: ["DELETE"],
    pattern: '/passkeys/:id',
    tokens: [[0,"passkeys"],[1,"id"]],
    types: placeholder as Registry['passkeys.delete_passkey']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
