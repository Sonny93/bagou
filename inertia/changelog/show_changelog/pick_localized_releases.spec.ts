import { describe, expect, it } from 'vitest';

import type { ChangelogRelease } from '~/changelog/changelog_release';
import { pickLocalizedReleases } from '~/changelog/show_changelog/pick_localized_releases';

const buildRelease = (version: string, entry: string): ChangelogRelease => ({
	version,
	date: '2026-10-28',
	intro: null,
	sections: [{ kind: 'Added', entries: [entry] }],
});

const ENGLISH = [buildRelease('1.2.0', 'New'), buildRelease('1.1.0', 'Old')];
const FRENCH = [buildRelease('1.1.0', 'Ancien')];

describe('pickLocalizedReleases', () => {
	it('should keep the English releases, tagged English, for an English locale', () => {
		expect(
			pickLocalizedReleases({ english: ENGLISH, french: FRENCH }, 'en')
		).toEqual([
			{ release: ENGLISH[0], language: 'en' },
			{ release: ENGLISH[1], language: 'en' },
		]);
	});

	it('should use the French release when it exists and fall back to English otherwise', () => {
		const releases = pickLocalizedReleases(
			{ english: ENGLISH, french: FRENCH },
			'fr'
		);

		expect(
			releases.map(({ release, language }) => [
				release.sections[0]?.entries[0],
				language,
			])
		).toEqual([
			['New', 'en'],
			['Ancien', 'fr'],
		]);
	});
});
