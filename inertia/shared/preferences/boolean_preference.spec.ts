import { describe, expect, it } from 'vitest';

import {
	readBooleanPreference,
	writeBooleanPreference,
	type BooleanPreference,
} from '~/shared/preferences/boolean_preference';

const OFF_BY_DEFAULT: BooleanPreference = {
	storageKey: 'bagou:test:off',
	defaultValue: false,
};
const ON_BY_DEFAULT: BooleanPreference = {
	storageKey: 'bagou:test:on',
	defaultValue: true,
};

const createFakeStorage = (initialEntries: Record<string, string> = {}) => {
	const entries = new Map(Object.entries(initialEntries));
	return {
		getItem: (key: string) => entries.get(key) ?? null,
		setItem: (key: string, value: string) => void entries.set(key, value),
	} as unknown as Storage;
};

const createThrowingStorage = (): Storage => {
	const fail = () => {
		throw new DOMException('blocked', 'SecurityError');
	};
	return { getItem: fail, setItem: fail } as unknown as Storage;
};

describe('boolean preference', () => {
	it.each([
		['off', OFF_BY_DEFAULT, false],
		['on', ON_BY_DEFAULT, true],
	])(
		'should use the default when nothing is stored (%s by default)',
		(_name, preference, expected) => {
			expect(readBooleanPreference(preference, createFakeStorage())).toBe(
				expected
			);
		}
	);

	it.each([OFF_BY_DEFAULT, ON_BY_DEFAULT])(
		'should read back the value that was written for $storageKey',
		(preference) => {
			const storage = createFakeStorage();

			writeBooleanPreference(preference, true, storage);
			expect(readBooleanPreference(preference, storage)).toBe(true);

			writeBooleanPreference(preference, false, storage);
			expect(readBooleanPreference(preference, storage)).toBe(false);
		}
	);

	it.each([OFF_BY_DEFAULT, ON_BY_DEFAULT])(
		'should use the default when the stored value is unparseable for $storageKey',
		(preference) => {
			const storage = createFakeStorage({ [preference.storageKey]: 'garbage' });

			expect(readBooleanPreference(preference, storage)).toBe(
				preference.defaultValue
			);
		}
	);

	it.each([OFF_BY_DEFAULT, ON_BY_DEFAULT])(
		'should use the default when there is no storage for $storageKey',
		(preference) => {
			expect(readBooleanPreference(preference, null)).toBe(
				preference.defaultValue
			);
		}
	);

	it('should use the default without throwing when reading fails', () => {
		expect(readBooleanPreference(ON_BY_DEFAULT, createThrowingStorage())).toBe(
			true
		);
	});

	it('should not throw when writing fails', () => {
		expect(() =>
			writeBooleanPreference(OFF_BY_DEFAULT, true, createThrowingStorage())
		).not.toThrow();
	});
});
