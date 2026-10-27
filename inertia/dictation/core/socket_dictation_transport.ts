import type { AppSocket } from '@generated/socket';
import { Socket } from '@rlanz/socket/client';

import type { DictationTransport } from './dictation_transport';

/**
 * One socket per dictation, with automatic reconnection off: a dictation that
 * loses its socket has lost its server-side session too, so it must fail
 * instead of silently resuming.
 */
export function createSocketDictationTransport(): DictationTransport {
	const socket = new Socket<AppSocket>({ autoReconnect: false });

	return {
		connect: () => socket.connect(),
		disconnect: () => socket.disconnect(),
		onConnectionLost: (listener) => {
			socket.onStateChange((state) => {
				if (state === 'disconnected') listener();
			});
		},
		join: async (dictationId, listener) => {
			const channel = socket.channel('dictation/:dictationId', { dictationId });
			channel
				.listen('transcript:partial', ({ text }) => listener.onPartial(text))
				.listen('transcript:final', ({ text }) => listener.onFinal(text))
				.listen('transcript:finished', ({ text }) => listener.onFinished(text))
				.listen('transcript:error', ({ code }) =>
					listener.onProviderError(code)
				);
			await channel.subscribe();
			return {
				start: async (request) => {
					if (request.kind === 'preview') {
						await channel.sendWithAck('dictation:preview', request.settings);
						return;
					}
					await channel.sendWithAck('dictation:start', request.context);
				},
				sendAudio: (chunk) => {
					channel.send('dictation:audio', { chunk });
				},
				stop: () => channel.sendWithAck('dictation:stop'),
				cancel: () => {
					channel.send('dictation:cancel');
				},
			};
		},
	};
}
