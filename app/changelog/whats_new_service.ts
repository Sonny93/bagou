import { APP_VERSION } from '#changelog/app_version';
import { compareVersions } from '#changelog/compare_versions';
import type { WhatsNew } from '#changelog/whats_new';
import type User from '#users/user';

/**
 * Tracks which version of the app a user last saw. Reads only the version and
 * the stored value: it never touches the changelog, so it cannot fail on it.
 *
 * A prerelease current version (anything but plain `x.y.z`) has no changelog
 * section, so it never announces anything and is never stored as seen: an
 * unparseable stored version would make every later stable comparison null
 * and the banner would never come back.
 */
export class WhatsNewService {
	constructor(readonly currentVersion: string = APP_VERSION) {}

	describe(lastSeenVersion: string | null): WhatsNew {
		return {
			currentVersion: this.currentVersion,
			hasUnseen: this.#hasUnseen(lastSeenVersion),
		};
	}

	/**
	 * Stores the current version as seen, only when nothing is stored yet or
	 * the stored version is older, so a rollback followed by a new upgrade
	 * shows the banner again. Stores nothing for a prerelease current version.
	 */
	async markSeen(user: User): Promise<void> {
		if (!this.#hasUnseen(user.lastSeenVersion)) return;
		user.lastSeenVersion = this.currentVersion;
		await user.save();
	}

	#hasUnseen(lastSeenVersion: string | null): boolean {
		if (!this.#isPlainVersion()) return false;
		if (!lastSeenVersion) return true;
		return compareVersions(this.currentVersion, lastSeenVersion) === 1;
	}

	#isPlainVersion(): boolean {
		return compareVersions(this.currentVersion, this.currentVersion) !== null;
	}
}
