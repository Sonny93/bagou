import type { DictationTranscript } from '#dictation/dictation_transcript';

export type DictationCompleter = (
	rawText: string
) => Promise<DictationTranscript>;
