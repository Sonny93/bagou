import type { DictationErrorEvent } from '#dictation/dictation_error_event';

export type DictationServerEvents = {
	'transcript:partial': { text: string };
	'transcript:final': { text: string };
	'transcript:error': DictationErrorEvent;
};
