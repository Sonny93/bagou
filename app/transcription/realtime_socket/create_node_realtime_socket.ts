import type { WebSocketFactory } from '#transcription/realtime_socket/web_socket_factory';

/**
 * Wraps Node's global WebSocket (undici), which accepts request headers. The
 * DOM typings that the inertia tsconfig also loads declare no such option, so
 * the socket is built through `Reflect.construct`. Non-text frames from the
 * server are ignored: the providers only speak JSON text.
 *
 * A binary send transmits exactly the view's own bytes (`byteOffset` and
 * `byteLength` are honored), even when it is a view into Node's shared Buffer
 * pool. `new Uint8Array(view)` only narrows the buffer type for `WebSocket.send`
 * (it rejects `SharedArrayBuffer`-backed views); the chunk is 3200 bytes.
 */
export const createNodeRealtimeSocket: WebSocketFactory = (url, headers) => {
	const socket: WebSocket = Reflect.construct(WebSocket, [url, { headers }]);
	return {
		send: (message) =>
			socket.send(
				typeof message === 'string' ? message : new Uint8Array(message)
			),
		close: () => socket.close(),
		onOpen: (listener) => socket.addEventListener('open', () => listener()),
		onMessage: (listener) =>
			socket.addEventListener('message', ({ data }) => {
				if (typeof data === 'string') listener(data);
			}),
		onError: (listener) => socket.addEventListener('error', () => listener()),
		onClose: (listener) =>
			socket.addEventListener('close', ({ code, reason }) =>
				listener(code, reason)
			),
	};
};
