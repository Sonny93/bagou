import { i18n } from '@lingui/core';
import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';
import { describe, expect, it } from 'vitest';

import { describeCleanupRequestError } from '~/shared/errors/describe_cleanup_request_error';

const buildHttpError = (body: unknown): TuyauHTTPError =>
	Object.assign(Object.create(TuyauHTTPError.prototype), { response: body });

describe('describeCleanupRequestError', () => {
	it('should word the unavailable cleanup from the application error code', () => {
		const error = buildHttpError({ code: 'E_TEXT_CLEANUP_UNAVAILABLE' });

		expect(describeCleanupRequestError(error, i18n)).toBe(
			'Text cleanup is unavailable'
		);
	});

	it('should word the throttling from the limiter message', () => {
		const error = buildHttpError({
			errors: [{ message: 'E_TOO_MANY_REQUESTS' }],
		});

		expect(describeCleanupRequestError(error, i18n)).toBe(
			'Too many requests, wait a minute'
		);
	});

	it('should word an unreachable server', () => {
		const error = Object.create(TuyauNetworkError.prototype);

		expect(describeCleanupRequestError(error, i18n)).toBe(
			'The server is unreachable'
		);
	});

	it('should fall back to the generic cleanup message otherwise', () => {
		expect(describeCleanupRequestError(new Error('boom'), i18n)).toBe(
			'Cleanup failed, try again'
		);
		expect(describeCleanupRequestError(buildHttpError(null), i18n)).toBe(
			'Cleanup failed, try again'
		);
	});
});
