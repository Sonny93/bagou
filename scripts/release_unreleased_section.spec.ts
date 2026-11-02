import { describe, expect, it } from 'vitest';

import { releaseUnreleasedSection } from '#scripts/release_unreleased_section.ts';

describe('releaseUnreleasedSection', () => {
	it('should date the Unreleased section and put a fresh empty one above it', () => {
		const markdown =
			'# Changelog\n\n## [Unreleased]\n\n### Added\n\n- Entrée.\n\n## [1.1.0] - 2026-10-28\n';

		expect(releaseUnreleasedSection(markdown, '1.2.0', '2026-11-03')).toBe(
			'# Changelog\n\n## [Unreleased]\n\n## [1.2.0] - 2026-11-03\n\n### Added\n\n- Entrée.\n\n## [1.1.0] - 2026-10-28\n'
		);
	});

	it('should return null when there is no Unreleased section', () => {
		expect(
			releaseUnreleasedSection('# Changelog\n', '1.2.0', '2026-11-03')
		).toBeNull();
	});
});
