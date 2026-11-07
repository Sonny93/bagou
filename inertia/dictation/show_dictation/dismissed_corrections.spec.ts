import { describe, expect, it } from 'vitest';

import {
	clearDismissedCorrections,
	readDismissedCorrections,
} from '~/dictation/show_dictation/dismissed_corrections';

const createFakeStorage = (initialValue?: string): Storage => {
	const entries = new Map<string, string>();
	if (initialValue !== undefined) {
		entries.set('bagou:dismissed-corrections', initialValue);
	}
	return {
		getItem: (key: string) => entries.get(key) ?? null,
		removeItem: (key: string) => void entries.delete(key),
	} as unknown as Storage;
};

const createThrowingStorage = (): Storage => {
	const fail = () => {
		throw new DOMException('blocked', 'SecurityError');
	};
	return { getItem: fail, removeItem: fail } as unknown as Storage;
};

const buildPair = (index: number) => ({
	heard: `heard ${index}`,
	written: `written ${index}`,
});

describe('dismissed corrections', () => {
	it('should read back the stored pairs, oldest first', () => {
		const storage = createFakeStorage(
			JSON.stringify([buildPair(1), buildPair(2)])
		);

		expect(readDismissedCorrections(storage)).toEqual([
			buildPair(1),
			buildPair(2),
		]);
	});

	it('should read nothing when the stored value is not a list of pairs', () => {
		expect(readDismissedCorrections(createFakeStorage('not json'))).toEqual([]);
		expect(
			readDismissedCorrections(createFakeStorage('{"heard":"a"}'))
		).toEqual([]);
	});

	it('should ignore the stored entries that are not pairs', () => {
		const storage = createFakeStorage(
			JSON.stringify([buildPair(1), { heard: 3 }, null])
		);

		expect(readDismissedCorrections(storage)).toEqual([buildPair(1)]);
	});

	it('should read nothing once cleared', () => {
		const storage = createFakeStorage(JSON.stringify([buildPair(1)]));

		clearDismissedCorrections(storage);

		expect(readDismissedCorrections(storage)).toEqual([]);
	});

	it('should work without throwing when storage is blocked', () => {
		const storage = createThrowingStorage();

		expect(() => clearDismissedCorrections(storage)).not.toThrow();
		expect(readDismissedCorrections(storage)).toEqual([]);
	});

	it('should work without throwing when storage is absent', () => {
		expect(() => clearDismissedCorrections(null)).not.toThrow();
		expect(readDismissedCorrections(null)).toEqual([]);
	});
});
