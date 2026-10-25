import type { RealtimeSocket } from '#transcription/providers/mistral/realtime_socket';

export type WebSocketFactory = (
	url: string,
	headers: Readonly<Record<string, string>>
) => RealtimeSocket;
