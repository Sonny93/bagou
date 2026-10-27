import type { DictationErrorEvent } from '#dictation/dictation_error_event';
import type { DictationTranscript } from '#dictation/dictation_transcript';

export type DictationServerEvents = {
	'transcript:partial': { text: string };
	'transcript:final': { text: string };
	'transcript:finished': { text: string };
	'transcript:error': DictationErrorEvent;
	'dictation:ready': Record<string, never>;
	'dictation:completed': DictationTranscript;
};
