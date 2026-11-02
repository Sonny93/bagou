import { describe, expect, it } from 'vitest';

import { buildChangelogFixture } from '#scripts/build_changelog_fixture.ts';
import { countUnreleasedEntries } from '#scripts/count_unreleased_entries.ts';

describe('countUnreleasedEntries', () => {
	it('should count the entries of each kind of the Unreleased section only', () => {
		const markdown = buildChangelogFixture({ addedCount: 3, fixedCount: 1 });

		expect(countUnreleasedEntries(markdown)).toEqual({ Added: 3, Fixed: 1 });
	});

	it('should count a kind without entries as zero', () => {
		const markdown = buildChangelogFixture({ addedCount: 0, fixedCount: 2 });

		expect(countUnreleasedEntries(markdown)).toEqual({ Added: 0, Fixed: 2 });
	});

	it('should return null when there is no Unreleased section', () => {
		expect(
			countUnreleasedEntries('# Changelog\n\n## [1.0.0] - 2026-01-01\n')
		).toBeNull();
	});

	it('should read a file with Windows line endings', () => {
		const markdown = buildChangelogFixture({
			addedCount: 2,
			fixedCount: 1,
		}).replaceAll('\n', '\r\n');

		expect(countUnreleasedEntries(markdown)).toEqual({ Added: 2, Fixed: 1 });
	});
});
