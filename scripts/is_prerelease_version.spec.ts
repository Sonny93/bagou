import { describe, expect, it } from 'vitest';

import { isPrereleaseVersion } from '#scripts/is_prerelease_version.ts';

describe('isPrereleaseVersion', () => {
	it('should return true when the version has a prerelease part', () => {
		expect(isPrereleaseVersion('1.3.0-next.0')).toBe(true);
		expect(isPrereleaseVersion('2.0.0-rc.1+build.5')).toBe(true);
	});

	it('should return false when the version is a stable release', () => {
		expect(isPrereleaseVersion('1.3.0')).toBe(false);
		expect(isPrereleaseVersion('1.3.0+build-5')).toBe(false);
	});
});
