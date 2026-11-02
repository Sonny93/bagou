import { describe, expect, it } from 'vitest';

import { isVersionNewer } from '~/changelog/is_version_newer';

describe('isVersionNewer', () => {
	it('should be true when the version is newer', () => {
		expect(isVersionNewer('1.2.4', '1.2.3')).toBe(true);
		expect(isVersionNewer('1.10.0', '1.9.9')).toBe(true);
		expect(isVersionNewer('2.0.0', '1.99.99')).toBe(true);
	});

	it('should be false when the version is equal or older', () => {
		expect(isVersionNewer('1.2.3', '1.2.3')).toBe(false);
		expect(isVersionNewer('1.2.3', '1.3.0')).toBe(false);
	});

	it('should be false when a version is unparseable', () => {
		expect(isVersionNewer('1.2', '1.0.0')).toBe(false);
		expect(isVersionNewer('1.2.3', 'abc')).toBe(false);
		expect(isVersionNewer('1.2.3-beta.1', '1.0.0')).toBe(false);
	});
});
