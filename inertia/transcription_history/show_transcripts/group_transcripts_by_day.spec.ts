import type { Data } from '@generated/data';
import { describe, expect, it } from 'vitest';

import { groupTranscriptsByDay } from './group_transcripts_by_day';

function buildTranscript(id: number, createdAt: Date): Data.Transcript {
	return {
		id,
		createdAt: createdAt.toISOString(),
		rawText: String(id),
		cleanedText: null,
	};
}

describe('groupTranscriptsByDay', () => {
	it('should return no group when the list is empty', () => {
		expect(groupTranscriptsByDay([])).toEqual([]);
	});

	it('should split entries across local midnight', () => {
		const groups = groupTranscriptsByDay([
			buildTranscript(1, new Date(2026, 10, 1, 0, 5)),
			buildTranscript(2, new Date(2026, 9, 31, 23, 55)),
		]);

		expect(groups.map((group) => group.dayKey)).toEqual([
			'2026-11-01',
			'2026-10-31',
		]);
	});

	it('should keep the input order inside and between groups', () => {
		const groups = groupTranscriptsByDay([
			buildTranscript(1, new Date(2026, 10, 1, 18)),
			buildTranscript(2, new Date(2026, 10, 1, 9)),
			buildTranscript(3, new Date(2026, 9, 30, 12)),
		]);

		expect(
			groups.map((group) => group.transcripts.map(({ id }) => id))
		).toEqual([[1, 2], [3]]);
	});

	it('should merge entries of the same day that are not adjacent into the first group', () => {
		const groups = groupTranscriptsByDay([
			buildTranscript(1, new Date(2026, 10, 1, 18)),
			buildTranscript(2, new Date(2026, 9, 30, 12)),
			buildTranscript(3, new Date(2026, 10, 1, 9)),
		]);

		expect(
			groups.map((group) => [
				group.dayKey,
				group.transcripts.map(({ id }) => id),
			])
		).toEqual([
			['2026-11-01', [1, 3]],
			['2026-10-30', [2]],
		]);
	});
});
