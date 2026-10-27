import type { DictationStartRequest } from './dictation_start_request';
import type { DictationTranscript } from './dictation_transcript';

export type TranscriptListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onFinished(text: string): void;
	onReady(): void;
	onCompleted(transcript: DictationTranscript): void;
	onProviderError(code: string): void;
};

/**
 * One dictation channel, already subscribed. `start` and `stop` resolve once
 * the server acknowledged the request; their outcome comes later through
 * `onReady` and `onCompleted`.
 */
export type JoinedDictation = {
	start(request: Readonly<DictationStartRequest>): Promise<void>;
	sendAudio(base64Pcm: string): void;
	stop(): Promise<void>;
	cancel(): void;
};

/**
 * The socket operations a dictation needs, so the client can be driven by an
 * in-memory fake in specs and by `@rlanz/socket` in the browser.
 */
export type DictationTransport = {
	connect(): Promise<void>;
	disconnect(): void;
	onConnectionLost(listener: () => void): void;
	join(
		dictationId: string,
		listener: TranscriptListener
	): Promise<JoinedDictation>;
};
