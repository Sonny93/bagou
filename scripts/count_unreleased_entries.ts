const UNRELEASED_HEADING = /^## \[Unreleased\]\s*$/;
const RELEASE_HEADING = /^## /;
const KIND_HEADING = /^### (.+?)\s*$/;
const ENTRY_LINE = /^- /;

/**
 * Counts the entries of each `### Kind` in the `## [Unreleased]` section of a
 * Keep a Changelog file, or returns null when the section is missing.
 */
export function countUnreleasedEntries(
	markdown: string
): Record<string, number> | null {
	const lines = markdown.split(/\r?\n/);
	const start = lines.findIndex((line) => UNRELEASED_HEADING.test(line));
	if (start === -1) return null;

	const counts: Record<string, number> = {};
	let currentKind: string | null = null;
	for (const line of lines.slice(start + 1)) {
		if (RELEASE_HEADING.test(line)) break;
		const kind = KIND_HEADING.exec(line)?.[1];
		if (kind) {
			currentKind = kind;
			counts[kind] = 0;
			continue;
		}
		if (!currentKind || !ENTRY_LINE.test(line)) continue;
		counts[currentKind] = (counts[currentKind] ?? 0) + 1;
	}
	return counts;
}
