const PRERELEASE_VERSION = /^\d+\.\d+\.\d+-[0-9A-Za-z.-]+(\+[0-9A-Za-z.-]+)?$/;

/**
 * Tells whether a semver version carries a prerelease part (`1.3.0-next.0`).
 */
export function isPrereleaseVersion(version: string): boolean {
	return PRERELEASE_VERSION.test(version);
}
