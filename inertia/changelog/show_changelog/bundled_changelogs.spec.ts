import { describe, expect, it } from 'vitest';

import type { ChangelogRelease } from '~/changelog/changelog_release';
import { parseChangelog } from '~/changelog/parse_changelog';
import { CHANGELOG_SOURCES } from '~/changelog/show_changelog/changelog_sources';

const summarize = ({
	version,
	date,
	intro,
	sections,
}: Readonly<ChangelogRelease>) => ({
	version,
	date,
	hasIntro: intro !== null,
	entryCounts: sections.map(({ kind, entries }) => [kind, entries.length]),
});

describe('bundled changelogs', () => {
	const englishReleases = parseChangelog(CHANGELOG_SOURCES.english);
	const frenchReleases = parseChangelog(CHANGELOG_SOURCES.french);

	it('should parse every English release, each with at least one entry', () => {
		const releaseHeadings = CHANGELOG_SOURCES.english.match(
			/^## \[\d+\.\d+\.\d+\]/gm
		);

		expect(englishReleases.length).toBeGreaterThan(0);
		expect(englishReleases).toHaveLength(releaseHeadings?.length ?? 0);
		expect(
			englishReleases.filter(({ sections }) => sections.length === 0)
		).toEqual([]);
	});

	it('should have a French twin for every English release, with the same entries per section', () => {
		expect(frenchReleases.map(summarize)).toEqual(
			englishReleases.map(summarize)
		);
	});
});
