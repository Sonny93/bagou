import type { DictationErrorCode } from '#dictation/dictation_error_code';

export type DictationErrorEvent = {
	code: DictationErrorCode;
	message: string;
};
