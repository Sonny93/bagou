/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  dictation: {
    showDictation: typeof routes['dictation.show_dictation']
  }
}
