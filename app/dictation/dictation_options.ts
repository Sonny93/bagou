import type { DictationUsageRecorder } from '#dictation/dictation_usage_recorder';

export type DictationOptions = {
	/** Audio bytes the user may still dictate today; reaching it ends the dictation. */
	remainingBytes: number;
	recordUsage: DictationUsageRecorder;
	maxDurationMs?: number;
};
