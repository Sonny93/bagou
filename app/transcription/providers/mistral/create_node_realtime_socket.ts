import type { WebSocketFactory } from '#transcription/providers/mistral/web_socket_factory';

/**
 * Wraps Node's global WebSocket (undici), which accepts request headers. The
 * DOM typings that the inertia tsconfig also loads declare no such option, so
 * the socket is built through `Reflect.construct`. Non-text frames are
 * ignored: the provider only speaks JSON text.
 */
export const createNodeRealtimeSocket: WebSocketFactory = (url, headers) => {
	const socket: WebSocket = Reflect.construct(WebSocket, [url, { headers }]);
	return {
		send: (message) => socket.send(message),
		close: () => socket.close(),
		onMessage: (listener) =>
			socket.addEventListener('message', ({ data }) => {
				if (typeof data === 'string') listener(data);
			}),
		onError: (listener) => socket.addEventListener('error', () => listener()),
		onClose: (listener) => socket.addEventListener('close', () => listener()),
	};
};
