import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

/** Wording per stable server error code (socket acks and `transcript:error` events). */
export const DICTATION_SERVER_ERROR_MESSAGES: Readonly<
	Record<string, MessageDescriptor>
> = {
	E_DICTATION_ALREADY_ACTIVE: msg`A dictation is already in progress`,
	E_DICTATION_NOT_ACTIVE: msg`No dictation is in progress`,
	E_DICTATION_QUOTA_EXCEEDED: msg`The daily dictation quota is reached, try again tomorrow`,
	E_DICTATION_RATE_LIMITED: msg`Too many dictations started, wait a minute`,
	E_DICTATION_TOO_LONG: msg`The dictation reached the maximum duration`,
	E_DICTATION_UNAVAILABLE: msg`Dictation is temporarily unavailable`,
	E_INVALID_AUDIO_CHUNK: msg`The audio segment is invalid or too large`,
	E_INVALID_DICTATION_ID: msg`The dictation identifier is invalid`,
	E_INVALID_DRAFT_CONTEXT: msg`The draft is invalid or too large`,
	E_TRANSCRIPTION_CONNECTION_FAILED: msg`Could not reach the transcription service`,
	E_TRANSCRIPTION_CONNECTION_CLOSED: msg`The connection to the transcription service was interrupted`,
	E_TRANSCRIPTION_PROVIDER_REJECTED: msg`The transcription service refused the dictation`,
	E_TRANSCRIPTION_FINISH_TIMEOUT: msg`The transcription service did not answer in time`,
	E_TRANSCRIPTION_SESSION_NOT_ACTIVE: msg`The transcription session is no longer active`,
	E_TRANSCRIPTION_SESSION_ABORTED: msg`The transcription session was interrupted`,
};
