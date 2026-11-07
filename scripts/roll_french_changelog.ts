import { readFileSync, writeFileSync } from 'node:fs';

import { findReleaseDate } from '#scripts/find_release_date.ts';
import { isPrereleaseVersion } from '#scripts/is_prerelease_version.ts';
import { releaseUnreleasedSection } from '#scripts/release_unreleased_section.ts';

const FRENCH_CHANGELOG = 'CHANGELOG.fr.md';

function failWith(message: string): void {
	console.error(message);
	process.exitCode = 1;
}

function rollFrenchChangelog(version: string | undefined): void {
	if (!version) return failWith('Usage: roll_french_changelog.ts <version>');
	if (isPrereleaseVersion(version)) return;
	const date = findReleaseDate(readFileSync('CHANGELOG.md', 'utf8'), version);
	if (!date) {
		return failWith(`CHANGELOG.md has no dated "## [${version}]" heading.`);
	}
	const released = releaseUnreleasedSection(
		readFileSync(FRENCH_CHANGELOG, 'utf8'),
		version,
		date
	);
	if (!released) {
		return failWith(`${FRENCH_CHANGELOG} has no "## [Unreleased]" section.`);
	}
	writeFileSync(FRENCH_CHANGELOG, released);
}

rollFrenchChangelog(process.argv[2]);
