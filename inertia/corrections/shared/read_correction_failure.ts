import { TuyauHTTPError, TuyauNetworkError } from '@tuyau/core/client';

type CorrectionFieldRules = {
	heard: string | null;
	written: string | null;
};

export type CorrectionFailure =
	| { kind: 'network' }
	| { kind: 'fields'; rules: CorrectionFieldRules }
	| { kind: 'code'; code: string }
	| { kind: 'unknown' };

const readProperty = (value: unknown, key: string): unknown =>
	typeof value === 'object' && value !== null
		? Reflect.get(value, key)
		: undefined;

const readString = (value: unknown, key: string): string | null => {
	const property = readProperty(value, key);
	return typeof property === 'string' ? property : null;
};

const readErrors = (body: unknown): readonly unknown[] => {
	const errors = readProperty(body, 'errors');
	return Array.isArray(errors) ? errors : [];
};

const readRule = (entry: unknown): string | null =>
	readString(entry, 'message') ?? readString(entry, 'rule');

const findFieldRule = (
	errors: readonly unknown[],
	field: keyof CorrectionFieldRules
): string | null => {
	const entry = errors.find(
		(candidate) => readString(candidate, 'field') === field
	);
	return entry === undefined ? null : readRule(entry);
};

const readHttpFailure = (body: unknown): CorrectionFailure => {
	const errors = readErrors(body);
	const rules = {
		heard: findFieldRule(errors, 'heard'),
		written: findFieldRule(errors, 'written'),
	};
	if (rules.heard !== null || rules.written !== null) {
		return { kind: 'fields', rules };
	}
	const code = readString(body, 'code') ?? readRule(errors[0]);
	return code === null ? { kind: 'unknown' } : { kind: 'code', code };
};

/**
 * Sorts whatever failed a corrections request: the network, a validation
 * rule per field, or the stable code the server sends.
 */
export function readCorrectionFailure(error: unknown): CorrectionFailure {
	if (error instanceof TuyauNetworkError) return { kind: 'network' };
	if (error instanceof TuyauHTTPError) return readHttpFailure(error.response);
	return { kind: 'unknown' };
}
