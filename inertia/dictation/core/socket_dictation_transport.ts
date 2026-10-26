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
				.listen('transcript:error', ({ message }) =>
					listener.onProviderError(message)
				);
			await channel.subscribe();
			return {
				start: async () => {
					await channel.sendWithAck('dictation:start');
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
