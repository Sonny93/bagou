type ChangelogFixtureOptions = {
	addedCount: number;
	fixedCount: number;
};

const entries = (count: number): string =>
	Array.from({ length: count }, (_, index) => `- Entry ${index + 1}.`).join(
		'\n'
	);

export function buildChangelogFixture({
	addedCount,
	fixedCount,
}: Readonly<ChangelogFixtureOptions>): string {
	return `# Changelog

## [Unreleased]

### Added

${entries(addedCount)}

### Fixed

${entries(fixedCount)}

## [1.1.0] - 2026-10-28

### Fixed

- Old entry.

[Unreleased]: https://example.com/compare/v1.1.0...HEAD
`;
}
