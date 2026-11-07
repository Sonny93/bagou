import { describe, expect, it } from 'vitest';

import { buildReviewList } from '~/correction_suggestions/shared/build_review_list';

const buildPending = (heard: string, written: string, createdAt: string) => ({
	heard,
	written,
	createdAt,
});

describe('buildReviewList', () => {
	it('should list the server suggestions then the local pairs when both exist', () => {
		const list = buildReviewList(
			[buildPending('Vox Tral', 'Voxtral', '2026-11-06T10:00:00.000Z')],
			[{ heard: 'adonis', written: 'AdonisJS' }]
		);

		expect(list.map(({ written, createdAt }) => [written, createdAt])).toEqual([
			['Voxtral', '2026-11-06T10:00:00.000Z'],
			['AdonisJS', null],
		]);
	});

	it('should show a pair once with the server date when it is on both sides, ignoring case', () => {
		const list = buildReviewList(
			[buildPending('Vox Tral', 'Voxtral', '2026-11-06T10:00:00.000Z')],
			[{ heard: 'vox tral', written: 'VOXTRAL' }]
		);

		expect(list).toHaveLength(1);
		expect(list[0]?.createdAt).toBe('2026-11-06T10:00:00.000Z');
	});

	it('should list nothing when there is nothing to review', () => {
		expect(buildReviewList([], [])).toEqual([]);
	});
});
