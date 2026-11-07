import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';
import { describe, expect, it } from 'vitest';

import { readCorrectionFailure } from '~/corrections/shared/read_correction_failure';

const buildHttpError = (body: unknown): TuyauHTTPError =>
	Object.assign(Object.create(TuyauHTTPError.prototype), { response: body });

describe('readCorrectionFailure', () => {
	it('should read the validation rule of each field', () => {
		const error = buildHttpError({
			errors: [
				{ field: 'heard', rule: 'required', message: 'required' },
				{ field: 'written', rule: 'notSameAs', message: 'notSameAs' },
			],
		});

		expect(readCorrectionFailure(error)).toEqual({
			kind: 'fields',
			rules: { heard: 'required', written: 'notSameAs' },
		});
	});

	it('should keep null for a field without error', () => {
		const error = buildHttpError({
			errors: [{ field: 'written', rule: 'regex', message: 'regex' }],
		});

		expect(readCorrectionFailure(error)).toEqual({
			kind: 'fields',
			rules: { heard: null, written: 'regex' },
		});
	});

	it('should read the stable code of an application error', () => {
		const error = buildHttpError({ code: 'E_CORRECTIONS_FULL' });

		expect(readCorrectionFailure(error)).toEqual({
			kind: 'code',
			code: 'E_CORRECTIONS_FULL',
		});
	});

	it('should read the throttling message as a code', () => {
		const error = buildHttpError({
			errors: [{ message: 'E_TOO_MANY_REQUESTS' }],
		});

		expect(readCorrectionFailure(error)).toEqual({
			kind: 'code',
			code: 'E_TOO_MANY_REQUESTS',
		});
	});

	it('should report an unreachable server', () => {
		const error = Object.create(TuyauNetworkError.prototype);

		expect(readCorrectionFailure(error)).toEqual({ kind: 'network' });
	});

	it('should report an unknown failure for any other error', () => {
		expect(readCorrectionFailure(new Error('boom'))).toEqual({
			kind: 'unknown',
		});
		expect(readCorrectionFailure(buildHttpError(null))).toEqual({
			kind: 'unknown',
		});
	});
});
