import type { DictationCompleter } from '#dictation/dictation_completer';
import type { DictationRawKeeper } from '#dictation/dictation_raw_keeper';
import type { DictationUsageRecorder } from '#dictation/dictation_usage_recorder';

export type DictationOptions = {
	/** Audio bytes the user may still dictate today; reaching it ends the dictation. */
	remainingBytes: number;
	recordUsage: DictationUsageRecorder;
	complete: DictationCompleter;
	/** Keeps the raw text of a cancelled dictation, without any cleanup. */
	keepRaw: DictationRawKeeper;
	maxDurationMs?: number;
};
