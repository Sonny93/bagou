import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';

import { describeCleanupError } from '~/transcription_history/show_transcripts/describe_cleanup_error';

const NETWORK_MESSAGE = msg`The server is unreachable`;
const RATE_LIMIT_CODE = 'E_TOO_MANY_REQUESTS';
const RATE_LIMIT_MESSAGE: MessageDescriptor = msg`Too many requests, wait a minute`;
const UNKNOWN_CODE = '';

const readString = (value: unknown, key: string): string | null => {
	if (typeof value !== 'object' || value === null) return null;
	const property: unknown = Reflect.get(value, key);
	return typeof property === 'string' ? property : null;
};

const readServerCode = (body: unknown): string => {
	if (typeof body === 'object' && body !== null && 'errors' in body) {
		const [firstError] = Array.isArray(body.errors) ? body.errors : [];
		return readString(firstError, 'message') ?? UNKNOWN_CODE;
	}
	return readString(body, 'code') ?? UNKNOWN_CODE;
};

/**
 * Wording for whatever fails a preview cleanup request: the stable code of
 * the application error, the throttling message, or the network.
 */
export function describePreviewCleanupError(
	error: unknown,
	i18n: I18n
): string {
	if (error instanceof TuyauNetworkError) return i18n._(NETWORK_MESSAGE);
	const code =
		error instanceof TuyauHTTPError
			? readServerCode(error.response)
			: UNKNOWN_CODE;
	if (code === RATE_LIMIT_CODE) return i18n._(RATE_LIMIT_MESSAGE);
	return describeCleanupError(code, i18n);
}
