import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'passkeys.create_authentication_options': { paramsTuple?: []; params?: {} }
    'passkeys.verify_authentication': { paramsTuple?: []; params?: {} }
    'passkeys.show_passkey_invitation': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.create_invitation_options': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.verify_invitation': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.show_passkeys': { paramsTuple?: []; params?: {} }
    'passkeys.create_registration_options': { paramsTuple?: []; params?: {} }
    'passkeys.verify_registration': { paramsTuple?: []; params?: {} }
    'passkeys.delete_passkey': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'passkeys.show_passkey_invitation': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.show_passkeys': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'passkeys.show_passkey_invitation': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.show_passkeys': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.logout': { paramsTuple?: []; params?: {} }
    'passkeys.create_authentication_options': { paramsTuple?: []; params?: {} }
    'passkeys.verify_authentication': { paramsTuple?: []; params?: {} }
    'passkeys.create_invitation_options': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.verify_invitation': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'passkeys.create_registration_options': { paramsTuple?: []; params?: {} }
    'passkeys.verify_registration': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'passkeys.delete_passkey': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}