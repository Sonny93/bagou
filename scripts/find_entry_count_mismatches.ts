import { countUnreleasedEntries } from '#scripts/count_unreleased_entries.ts';

/**
 * Compares the entries per kind of the `Unreleased` sections of the English
 * and French changelogs. Returns one readable message per problem, none when
 * the two files agree.
 */
export function findEntryCountMismatches(
	english: string,
	french: string
): string[] {
	const englishCounts = countUnreleasedEntries(english);
	const frenchCounts = countUnreleasedEntries(french);
	if (!englishCounts) return ['CHANGELOG.md has no "## [Unreleased]" section.'];
	if (!frenchCounts)
		return ['CHANGELOG.fr.md has no "## [Unreleased]" section.'];

	const kinds = new Set([
		...Object.keys(englishCounts),
		...Object.keys(frenchCounts),
	]);
	return [...kinds].flatMap((kind) => {
		const englishCount = englishCounts[kind] ?? 0;
		const frenchCount = frenchCounts[kind] ?? 0;
		if (englishCount === frenchCount) return [];
		return [
			`"### ${kind}" in "## [Unreleased]" has ${englishCount} entries in CHANGELOG.md but ${frenchCount} in CHANGELOG.fr.md.`,
		];
	});
}
