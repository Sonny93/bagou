import { tuyauClient } from '~/shared/lib/tuyau_client';

/** Records that the user saw the current version. Rejects when the request fails. */
export async function markChangelogSeen(): Promise<void> {
	await tuyauClient.request('changelog.mark_changelog_seen', {});
}
