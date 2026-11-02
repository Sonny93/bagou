import { describe, expect, it } from 'vitest';

import { findReleaseDate } from '#scripts/find_release_date.ts';

const MARKDOWN = `## [Unreleased]

## [1.2.0] - 2026-11-03

## [1.1.0] - 2026-10-28
`;

describe('findReleaseDate', () => {
	it('should return the date of the heading of the version', () => {
		expect(findReleaseDate(MARKDOWN, '1.2.0')).toBe('2026-11-03');
		expect(findReleaseDate(MARKDOWN, '1.1.0')).toBe('2026-10-28');
	});

	it('should return null when the version has no dated heading', () => {
		expect(findReleaseDate(MARKDOWN, '1.3.0')).toBeNull();
		expect(findReleaseDate(MARKDOWN, '1.2')).toBeNull();
	});

	it('should not treat dots of the version as wildcards', () => {
		expect(findReleaseDate(MARKDOWN, '1x2x0')).toBeNull();
	});
});
