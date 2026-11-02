import { isVersionNewer } from '~/changelog/is_version_newer';

type ReleaseNewness = {
	version: string;
	index: number;
	previousSeenVersion: string | null;
};

/**
 * A release is new when it is newer than the version the user last saw; when
 * they saw none, only the newest release (the first) is.
 */
export function isReleaseNew({
	version,
	index,
	previousSeenVersion,
}: Readonly<ReleaseNewness>): boolean {
	if (previousSeenVersion === null) return index === 0;
	return isVersionNewer(version, previousSeenVersion);
}
