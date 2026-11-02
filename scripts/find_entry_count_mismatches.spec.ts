import { describe, expect, it } from 'vitest';

import { buildChangelogFixture } from '#scripts/build_changelog_fixture.ts';
import { findEntryCountMismatches } from '#scripts/find_entry_count_mismatches.ts';

describe('findEntryCountMismatches', () => {
	it('should return nothing when both files have the same counts per kind', () => {
		const english = buildChangelogFixture({ addedCount: 3, fixedCount: 1 });
		const french = buildChangelogFixture({ addedCount: 3, fixedCount: 1 });

		expect(findEntryCountMismatches(english, french)).toEqual([]);
	});

	it('should name the kind and both counts when a French entry is missing', () => {
		const english = buildChangelogFixture({ addedCount: 3, fixedCount: 1 });
		const french = buildChangelogFixture({ addedCount: 2, fixedCount: 1 });

		expect(findEntryCountMismatches(english, french)).toEqual([
			'"### Added" in "## [Unreleased]" has 3 entries in CHANGELOG.md but 2 in CHANGELOG.fr.md.',
		]);
	});

	it('should report a kind that only one file has', () => {
		const english = buildChangelogFixture({ addedCount: 1, fixedCount: 1 });
		const french = '## [Unreleased]\n\n### Added\n\n- Entrée.\n';

		expect(findEntryCountMismatches(english, french)).toEqual([
			'"### Fixed" in "## [Unreleased]" has 1 entries in CHANGELOG.md but 0 in CHANGELOG.fr.md.',
		]);
	});

	it('should report a missing Unreleased section', () => {
		const english = buildChangelogFixture({ addedCount: 1, fixedCount: 1 });

		expect(findEntryCountMismatches(english, '# Changelog\n')).toEqual([
			'CHANGELOG.fr.md has no "## [Unreleased]" section.',
		]);
		expect(findEntryCountMismatches('# Changelog\n', english)).toEqual([
			'CHANGELOG.md has no "## [Unreleased]" section.',
		]);
	});
});
