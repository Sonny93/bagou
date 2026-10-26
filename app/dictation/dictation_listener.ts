import type { DictationErrorEvent } from '#dictation/dictation_error_event';

export type DictationListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onFinished(text: string): void;
	onError(event: Readonly<DictationErrorEvent>): void;
};
