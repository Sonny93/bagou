import { EventEmitter } from 'node:events';

import type { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { TranscriptionSessionEvents } from '#transcription/transcription_session_events';

/**
 * One live transcription over one provider connection.
 *
 * Event contract every adapter must map its provider onto. The displayed
 * transcript is the concatenation of every `final` text followed by the
 * current `partial` text:
 *
 * - `final` `{ text }`: newly committed text. Append-only, never revised, and
 *   carries its own spaces and punctuation (consumers must not add separators).
 * - `partial` `{ text }`: the current uncommitted tail. Each event replaces the
 *   previous partial; an empty string clears it. Providers that only emit
 *   committed text never emit `partial`.
 * - `error` `{ error }`: the session failed and is closed. A pending `finish()`
 *   rejects with the same error.
 *
 * `finish()` resolves the full final text once the provider confirms it.
 * Audio is PCM s16le, 16 kHz, mono (see `PCM_AUDIO_FORMAT`).
 */
export abstract class TranscriptionSession extends EventEmitter<TranscriptionSessionEvents> {
	abstract sendAudio(pcm: Uint8Array): void;

	/** Signals the end of audio, then resolves the full final text. */
	abstract finish(): Promise<string>;

	/** Closes immediately without waiting for the provider. Idempotent. */
	abstract abort(): void;

	/**
	 * Emits `error` unless nobody listens: an unhandled `error` event would
	 * otherwise throw inside the provider's socket callback.
	 */
	protected reportError(error: TranscriptionProviderError): void {
		if (this.listenerCount('error') === 0) return;
		this.emit('error', { error });
	}
}
