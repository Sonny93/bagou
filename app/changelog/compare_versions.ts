const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

type VersionOrder = -1 | 0 | 1;

function parseVersion(version: string): number[] | null {
	const match = VERSION_PATTERN.exec(version);
	if (!match) return null;
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Orders two plain `x.y.z` versions: -1 when `first` is older, 1 when it is
 * newer, 0 when equal. Returns null, and never throws, when either version
 * is not plain `x.y.z`, so a caller testing for `=== 1` treats it as "no new
 * version". Prereleases such as `1.2.0-next.0` are unparseable on purpose:
 * `WhatsNewService` relies on the null to keep them out of the seen versions.
 */
export function compareVersions(
	first: string,
	second: string
): VersionOrder | null {
	const firstParts = parseVersion(first);
	const secondParts = parseVersion(second);
	if (!firstParts || !secondParts) return null;
	for (const [index, firstPart] of firstParts.entries()) {
		const secondPart = secondParts[index] ?? 0;
		if (firstPart < secondPart) return -1;
		if (firstPart > secondPart) return 1;
	}
	return 0;
}
