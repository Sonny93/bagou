import { i18n } from '@lingui/core';
import { TuyauHTTPError } from '@tuyau/core/client';
import { describe, expect, it } from 'vitest';

import { describePasskeyError } from './describe_passkey_error';
import { activateLocale } from '~/i18n/activate_locale';

const buildHttpError = (body: unknown): TuyauHTTPError => {
	const kyError: ConstructorParameters<typeof TuyauHTTPError>[0] =
		Object.create(null);
	return new TuyauHTTPError(kyError, body);
};

describe('describePasskeyError', () => {
	it('should word the stable code of an application error', () => {
		const error = buildHttpError({
			code: 'E_LAST_PASSKEY',
			message: 'The last passkey cannot be deleted',
		});

		expect(describePasskeyError(error, i18n)).toBe(
			'Cannot delete the last passkey'
		);
	});

	it('should word the failed rule of a validation error', () => {
		const error = buildHttpError({
			errors: [{ field: 'label', message: 'required', rule: 'required' }],
		});

		expect(describePasskeyError(error, i18n)).toBe('This field is required');
	});

	it('should word a throttling error', () => {
		const error = buildHttpError({
			errors: [{ message: 'E_TOO_MANY_REQUESTS', retryAfter: 42 }],
		});

		expect(describePasskeyError(error, i18n)).toBe(
			'Too many requests, wait a minute'
		);
	});

	it('should fall back to a generic message for an unknown code', () => {
		const error = buildHttpError({ code: 'E_SOMETHING_NEW' });

		expect(describePasskeyError(error, i18n)).toBe(
			'Something went wrong, try again'
		);
	});

	it('should word a cancelled browser ceremony', () => {
		const error = new DOMException('cancelled', 'NotAllowedError');

		expect(describePasskeyError(error, i18n)).toBe('Operation cancelled');
	});

	it('should word an application error in French when the French locale is active', async () => {
		await activateLocale('fr');
		const error = buildHttpError({ code: 'E_LAST_PASSKEY' });

		expect(describePasskeyError(error, i18n)).toBe(
			'Impossible de supprimer la dernière passkey'
		);
	});
});
