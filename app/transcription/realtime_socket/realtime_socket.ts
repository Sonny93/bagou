/**
 * The few WebSocket capabilities the provider adapters rely on, so specs can
 * drive them with an in-memory socket instead of a real connection.
 */
export type RealtimeSocket = {
	/** A string goes out as a text frame, bytes as a binary frame of exactly those bytes. */
	send(message: string | Uint8Array): void;
	close(): void;
	onOpen(listener: () => void): void;
	onMessage(listener: (message: string) => void): void;
	onError(listener: () => void): void;
	onClose(listener: (code: number, reason: string) => void): void;
};
