const UNRELEASED_HEADING = /^## \[Unreleased\][ \t]*$/m;

/**
 * Turns `## [Unreleased]` into `## [version] - date` and puts a fresh empty
 * `## [Unreleased]` above it. Returns null when the file has no `Unreleased`
 * heading.
 */
export function releaseUnreleasedSection(
	markdown: string,
	version: string,
	date: string
): string | null {
	if (!UNRELEASED_HEADING.test(markdown)) return null;
	return markdown.replace(
		UNRELEASED_HEADING,
		() => `## [Unreleased]\n\n## [${version}] - ${date}`
	);
}
