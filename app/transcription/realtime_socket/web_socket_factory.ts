import type { RealtimeSocket } from '#transcription/realtime_socket/realtime_socket';

export type WebSocketFactory = (
	url: string,
	headers: Readonly<Record<string, string>>
) => RealtimeSocket;
