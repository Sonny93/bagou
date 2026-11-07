import { describe, expect, it } from 'vitest';

import {
	MAX_DISMISSED_CORRECTIONS,
	appendDismissedCorrection,
	readDismissedCorrections,
} from '~/dictation/show_dictation/dismissed_corrections';

const createFakeStorage = (initialValue?: string): Storage => {
	const entries = new Map<string, string>();
	if (initialValue !== undefined) {
		entries.set('bagou:dismissed-corrections', initialValue);
	}
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

const buildPair = (index: number) => ({
	heard: `heard ${index}`,
	written: `written ${index}`,
});

describe('dismissed corrections', () => {
	it('should read back the pairs appended, oldest first', () => {
		const storage = createFakeStorage();

		appendDismissedCorrection(buildPair(1), storage);
		appendDismissedCorrection(buildPair(2), storage);

		expect(readDismissedCorrections(storage)).toEqual([
			buildPair(1),
			buildPair(2),
		]);
	});

	it('should keep a pair dismissed again once, as the most recent', () => {
		const storage = createFakeStorage();
		appendDismissedCorrection(buildPair(1), storage);
		appendDismissedCorrection(buildPair(2), storage);

		appendDismissedCorrection(
			{ heard: 'HEARD 1', written: 'written 1' },
			storage
		);

		expect(readDismissedCorrections(storage)).toEqual([
			buildPair(2),
			{ heard: 'HEARD 1', written: 'written 1' },
		]);
	});

	it('should drop the oldest pairs beyond the cap', () => {
		const storage = createFakeStorage();

		for (let index = 0; index <= MAX_DISMISSED_CORRECTIONS; index += 1) {
			appendDismissedCorrection(buildPair(index), storage);
		}

		const dismissed = readDismissedCorrections(storage);
		expect(dismissed).toHaveLength(MAX_DISMISSED_CORRECTIONS);
		expect(dismissed[0]).toEqual(buildPair(1));
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

	it('should work without throwing when storage is blocked', () => {
		const storage = createThrowingStorage();

		expect(() =>
			appendDismissedCorrection(buildPair(1), storage)
		).not.toThrow();
		expect(readDismissedCorrections(storage)).toEqual([]);
	});

	it('should work without throwing when storage is absent', () => {
		expect(() => appendDismissedCorrection(buildPair(1), null)).not.toThrow();
		expect(readDismissedCorrections(null)).toEqual([]);
	});
});
