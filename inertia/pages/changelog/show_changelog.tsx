import { Trans } from '@lingui/react/macro';

import { isReleaseNew } from '~/changelog/show_changelog/is_release_new';
import { MissingReleaseNotice } from '~/changelog/show_changelog/missing_release_notice';
import { ReleaseCard } from '~/changelog/show_changelog/release_card';
import { useChangelogReleases } from '~/changelog/show_changelog/use_changelog_releases';
import { useMarkChangelogSeenOnMount } from '~/changelog/show_changelog/use_mark_changelog_seen_on_mount';
import { APP_VERSION } from '~/shared/lib/app_version';
import { AppHeader } from '~/shared/ui/app_header';
import { AppThemeToggle } from '~/shared/ui/app_theme_toggle';
import { BackToDictationLink } from '~/shared/ui/back_to_dictation_link';

type ShowChangelogProps = {
	previousSeenVersion: string | null;
};

export default function ShowChangelog({
	previousSeenVersion,
}: Readonly<ShowChangelogProps>) {
	useMarkChangelogSeenOnMount();
	const releases = useChangelogReleases();
	const hasCurrentRelease = releases.some(
		({ release }) => release.version === APP_VERSION
	);

	return (
		<div className="flex min-h-dvh flex-col">
			<AppHeader maxWidthClassName="max-w-xl">
				<BackToDictationLink />
				<AppThemeToggle />
			</AppHeader>
			<main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 sm:px-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold">
						<Trans>What's new</Trans>
					</h1>
					<p className="text-muted">
						<Trans>What changed in each version of Bagou.</Trans>
					</p>
				</div>
				{!hasCurrentRelease && <MissingReleaseNotice />}
				{releases.map(({ release, language }, index) => (
					<ReleaseCard
						key={release.version}
						release={release}
						language={language}
						isNew={isReleaseNew({
							version: release.version,
							index,
							previousSeenVersion,
						})}
					/>
				))}
			</main>
		</div>
	);
}
