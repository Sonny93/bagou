const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * Finds the date of the `## [version] - YYYY-MM-DD` heading of a Keep a
 * Changelog file, or returns null when that release has no dated heading.
 */
export function findReleaseDate(
	markdown: string,
	version: string
): string | null {
	const escapedVersion = version.replace(REGEX_SPECIAL_CHARACTERS, '\\$&');
	const heading = new RegExp(
		`^## \\[${escapedVersion}\\] - (\\d{4}-\\d{2}-\\d{2})\\s*$`,
		'm'
	);
	return heading.exec(markdown)?.[1] ?? null;
}
