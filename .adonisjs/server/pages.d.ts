import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'dictation/show_dictation': ExtractProps<(typeof import('../../inertia/pages/dictation/show_dictation.tsx'))['default']>
    'passkeys/show_login': ExtractProps<(typeof import('../../inertia/pages/passkeys/show_login.tsx'))['default']>
    'passkeys/show_passkey_invitation': ExtractProps<(typeof import('../../inertia/pages/passkeys/show_passkey_invitation.tsx'))['default']>
    'passkeys/show_passkeys': ExtractProps<(typeof import('../../inertia/pages/passkeys/show_passkeys.tsx'))['default']>
    'transcription_history/show_transcripts': ExtractProps<(typeof import('../../inertia/pages/transcription_history/show_transcripts.tsx'))['default']>
    'user_settings/show_settings': ExtractProps<(typeof import('../../inertia/pages/user_settings/show_settings.tsx'))['default']>
  }
}
