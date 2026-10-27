import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';

import { describeValidationRule } from '~/shared/i18n/describe_validation_rule';

const GENERIC_MESSAGE = msg`Something went wrong, try again`;
const CANCELLED_MESSAGE = msg`Operation cancelled`;
const ALREADY_REGISTERED_MESSAGE = msg`This passkey is already registered`;
const NETWORK_MESSAGE = msg`The server is unreachable`;

const SERVER_ERROR_MESSAGES: Readonly<Record<string, MessageDescriptor>> = {
	E_INVALID_PASSKEY_INVITATION: msg`This invitation link is invalid or has expired`,
	E_LAST_PASSKEY: msg`Cannot delete the last passkey`,
	E_MISSING_PASSKEY_CHALLENGE: msg`The request has expired, start again`,
	E_PASSKEY_AUTHENTICATION_FAILED: msg`Sign-in refused`,
	E_PASSKEY_NOT_FOUND: msg`Passkey not found`,
	E_PASSKEY_REGISTRATION_FAILED: msg`The passkey could not be registered`,
	E_TOO_MANY_REQUESTS: msg`Too many requests, wait a minute`,
};

const readString = (value: unknown, key: string): string | null => {
	if (typeof value !== 'object' || value === null) return null;
	const property: unknown = Reflect.get(value, key);
	return typeof property === 'string' ? property : null;
};

const readServerCode = (body: unknown): string | null => {
	if (typeof body !== 'object' || body === null) return null;
	if ('errors' in body && Array.isArray(body.errors)) {
		const [firstError] = body.errors;
		return readString(firstError, 'rule') ?? readString(firstError, 'message');
	}
	return readString(body, 'code');
};

const describeServerCode = (code: string | null, i18n: I18n): string => {
	if (code === null) return i18n._(GENERIC_MESSAGE);
	const serverMessage = SERVER_ERROR_MESSAGES[code];
	if (serverMessage !== undefined) return i18n._(serverMessage);
	return describeValidationRule(code, i18n) ?? i18n._(GENERIC_MESSAGE);
};

/**
 * Turns anything thrown by a passkey ceremony (browser, server, network)
 * into a message in the active language, safe to show to the user. The server
 * sends stable codes: `code` for an application error, the failed `rule` for a
 * validation error, the `message` of a throttling error.
 */
export function describePasskeyError(error: unknown, i18n: I18n): string {
	if (error instanceof TuyauHTTPError) {
		return describeServerCode(readServerCode(error.response), i18n);
	}
	if (error instanceof TuyauNetworkError) return i18n._(NETWORK_MESSAGE);
	if (!(error instanceof Error)) return i18n._(GENERIC_MESSAGE);
	if (error.name === 'NotAllowedError') return i18n._(CANCELLED_MESSAGE);
	if (error.name === 'InvalidStateError') {
		return i18n._(ALREADY_REGISTERED_MESSAGE);
	}
	return i18n._(GENERIC_MESSAGE);
}
