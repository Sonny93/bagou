import { describe, expect, it } from 'vitest';

import {
	readAutoStartPreference,
	writeAutoStartPreference,
} from './auto_start_preference';

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

describe('auto start preference', () => {
	it('should default to false when nothing is stored', () => {
		expect(readAutoStartPreference(createFakeStorage())).toBe(false);
	});

	it('should read back the value that was written', () => {
		const storage = createFakeStorage();

		writeAutoStartPreference(true, storage);
		expect(readAutoStartPreference(storage)).toBe(true);

		writeAutoStartPreference(false, storage);
		expect(readAutoStartPreference(storage)).toBe(false);
	});

	it('should return false when the stored value is unparseable', () => {
		const storage = createFakeStorage({
			'vts-pwa:dictation:auto-start': 'garbage',
		});

		expect(readAutoStartPreference(storage)).toBe(false);
	});

	it('should return false when there is no storage', () => {
		expect(readAutoStartPreference(null)).toBe(false);
	});

	it('should return false without throwing when reading fails', () => {
		expect(readAutoStartPreference(createThrowingStorage())).toBe(false);
	});

	it('should not throw when writing fails', () => {
		expect(() =>
			writeAutoStartPreference(true, createThrowingStorage())
		).not.toThrow();
	});
});
