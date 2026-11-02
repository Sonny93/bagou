import { describe, expect, it } from 'vitest';

import { parseChangelog } from '~/changelog/parse_changelog';

const CHANGELOG = `# Changelog

All notable changes are documented here.

## [Unreleased]

### Added

- Not released yet.

## [1.1.0] - 2026-10-28

### Fixed

- The cleaned text no longer gets stuck.
- A slow start no longer fails.

### Changed

- Errors are shown as \`notifications\`.
  They no longer fail silently.

## [1.0.0] - 2026-10-27

First public release.

### Added

- Dictate by voice.

### Mystery

- An entry of an unknown section.

## [Not a version]

### Added

- Ignored.

[Unreleased]: https://example.com/compare/v1.1.0...HEAD
[1.0.0]: https://example.com/releases/tag/v1.0.0
`;

describe('parseChangelog', () => {
	it('should return the dated releases in file order', () => {
		const releases = parseChangelog(CHANGELOG);

		expect(releases.map(({ version, date }) => ({ version, date }))).toEqual([
			{ version: '1.1.0', date: '2026-10-28' },
			{ version: '1.0.0', date: '2026-10-27' },
		]);
	});

	it('should read the sections and entries of a release, keeping inline backticks', () => {
		const [release] = parseChangelog(CHANGELOG);

		expect(release?.sections).toEqual([
			{
				kind: 'Fixed',
				entries: [
					'The cleaned text no longer gets stuck.',
					'A slow start no longer fails.',
				],
			},
			{
				kind: 'Changed',
				entries: [
					'Errors are shown as `notifications`. They no longer fail silently.',
				],
			},
		]);
	});

	it('should read the intro of a release, and null when it has none', () => {
		const [newest, oldest] = parseChangelog(CHANGELOG);

		expect(newest?.intro).toBeNull();
		expect(oldest?.intro).toBe('First public release.');
	});

	it('should skip Unreleased, unknown headings and link references', () => {
		const releases = parseChangelog(CHANGELOG);

		expect(
			releases.flatMap(({ sections }) => sections.map(({ kind }) => kind))
		).toEqual(['Fixed', 'Changed', 'Added']);
		expect(JSON.stringify(releases)).not.toContain('Not released yet');
		expect(JSON.stringify(releases)).not.toContain('example.com');
	});

	it('should return no release for an empty or malformed text', () => {
		expect(parseChangelog('')).toEqual([]);
		expect(parseChangelog('## [1.0] - soon\n- stray')).toEqual([]);
	});

	it('should read a file with Windows line endings', () => {
		const releases = parseChangelog(CHANGELOG.replaceAll('\n', '\r\n'));

		expect(releases).toHaveLength(2);
		expect(releases[1]?.intro).toBe('First public release.');
	});
});
