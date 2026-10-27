import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { DictationClientError } from '~/dictation/core/dictation_client_error';
import {
	MicrophoneError,
	type MicrophoneErrorCode,
} from '~/dictation/core/microphone_error';
import { DICTATION_SERVER_ERROR_MESSAGES } from '~/dictation/show_dictation/dictation_server_error_messages';

const GENERIC_MESSAGE = msg`Something went wrong during the dictation`;
const CONNECTION_FAILED_MESSAGE = msg`The server is unreachable`;
const START_TIMED_OUT_MESSAGE = msg`The dictation service is not responding, try again`;
const COMPLETION_TIMED_OUT_MESSAGE = msg`The cleanup is taking too long, your dictation will be in the history`;
const CONNECTION_LOST_MESSAGE = msg`The connection was interrupted, the dictation is lost`;

const MICROPHONE_MESSAGES: Record<MicrophoneErrorCode, MessageDescriptor> = {
	permission_denied: msg`Microphone access was denied, allow it in the browser`,
	no_device: msg`No microphone detected`,
	unsupported: msg`This browser cannot record the microphone`,
	audio_blocked: msg`The browser blocks audio, click in the page then start the dictation again`,
	failed: msg`Unable to use the microphone`,
};

const describeClientError = (
	error: DictationClientError,
	i18n: I18n
): string => {
	if (error.code === 'connection_failed') {
		return i18n._(CONNECTION_FAILED_MESSAGE);
	}
	if (error.code === 'connection_lost') return i18n._(CONNECTION_LOST_MESSAGE);
	if (error.code === 'start_timed_out') return i18n._(START_TIMED_OUT_MESSAGE);
	if (error.code === 'completion_timed_out') {
		return i18n._(COMPLETION_TIMED_OUT_MESSAGE);
	}
	if (error.serverCode === null) return i18n._(GENERIC_MESSAGE);
	return i18n._(
		DICTATION_SERVER_ERROR_MESSAGES[error.serverCode] ?? GENERIC_MESSAGE
	);
};

/** Wording, in the active language, for whatever can go wrong during a dictation. */
export function describeDictationError(error: unknown, i18n: I18n): string {
	if (error instanceof MicrophoneError) {
		return i18n._(MICROPHONE_MESSAGES[error.code]);
	}
	if (error instanceof DictationClientError) {
		return describeClientError(error, i18n);
	}
	return i18n._(GENERIC_MESSAGE);
}
