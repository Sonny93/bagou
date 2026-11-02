export const CHANGELOG_SECTION_KINDS = [
	'Added',
	'Changed',
	'Deprecated',
	'Removed',
	'Fixed',
	'Security',
] as const;

export type ChangelogSectionKind = (typeof CHANGELOG_SECTION_KINDS)[number];
