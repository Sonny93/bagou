export interface AppSocket {

  readonly channels: {

    readonly 'dictation/:dictationId': {

      readonly params: {

        readonly 'dictationId': string | number

      }

      readonly channel: typeof import('#app/dictation/dictation_channel').default

      readonly handlers: {

        readonly 'dictation:start': 'start'

        readonly 'dictation:preview': 'startPreview'

        readonly 'dictation:audio': 'appendAudio'

        readonly 'dictation:stop': 'stop'

        readonly 'dictation:cancel': 'cancel'

      }

    }

  }

}

