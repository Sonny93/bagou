export type TranscriptListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onProviderError(message: string): void;
};

/** One dictation channel, already subscribed. */
export type JoinedDictation = {
	start(): Promise<void>;
	sendAudio(base64Pcm: string): void;
	stop(): Promise<string>;
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
