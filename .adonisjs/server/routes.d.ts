import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'dictation.show_dictation': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}