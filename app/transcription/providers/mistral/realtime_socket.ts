/**
 * The few WebSocket capabilities the Mistral adapter relies on, so specs can
 * drive it with an in-memory socket instead of a real connection.
 */
export type RealtimeSocket = {
	send(message: string): void;
	close(): void;
	onMessage(listener: (message: string) => void): void;
	onError(listener: () => void): void;
	onClose(listener: () => void): void;
};
