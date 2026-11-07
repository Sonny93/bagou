import type { DictationCompleter } from '#dictation/dictation_completer';
import type { DictationRawKeeper } from '#dictation/dictation_raw_keeper';
import type { DictationUsageRecorder } from '#dictation/dictation_usage_recorder';
import type { DictationLanguage } from '#shared/dictation_language';

export type DictationOptions = {
	language: DictationLanguage;
	vocabulary: readonly string[];
	/** Audio bytes the user may still dictate today; reaching it ends the dictation. */
	remainingBytes: number;
	recordUsage: DictationUsageRecorder;
	complete: DictationCompleter;
	/** Keeps the raw text of a cancelled dictation, without any cleanup. */
	keepRaw: DictationRawKeeper;
	maxDurationMs?: number;
	/** Silence (no recognized speech) after which the dictation finishes by itself. */
	silenceTimeoutMs?: number;
};
