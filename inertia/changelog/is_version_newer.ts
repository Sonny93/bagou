const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

function parseVersion(version: string): number[] | null {
	const match = VERSION_PATTERN.exec(version);
	if (!match) return null;
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Whether `version` is newer than `reference`, both plain `x.y.z` (this
 * project has no prereleases). False when either one is unparseable.
 */
export function isVersionNewer(version: string, reference: string): boolean {
	const versionParts = parseVersion(version);
	const referenceParts = parseVersion(reference);
	if (!versionParts || !referenceParts) return false;
	for (const [index, part] of versionParts.entries()) {
		const referencePart = referenceParts[index] ?? 0;
		if (part !== referencePart) return part > referencePart;
	}
	return false;
}
