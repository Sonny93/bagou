import { Trans, useLingui } from '@lingui/react/macro';
import { Badge } from '@minimalstuff/ui';

import type {
	ChangelogLanguage,
	ChangelogRelease,
} from '~/changelog/changelog_release';
import { formatReleaseDate } from '~/changelog/show_changelog/format_release_date';
import { ReleaseSection } from '~/changelog/show_changelog/release_section';

type ReleaseCardProps = {
	release: ChangelogRelease;
	language: ChangelogLanguage;
	isNew: boolean;
};

export function ReleaseCard({
	release,
	language,
	isNew,
}: Readonly<ReleaseCardProps>) {
	const { i18n } = useLingui();
	const contentLanguage = i18n.locale.startsWith(language)
		? undefined
		: language;
	const headingId = `release-${release.version}`;

	return (
		<article
			aria-labelledby={headingId}
			className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4"
		>
			<header className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<h2 id={headingId} className="text-lg font-semibold">
					{release.version}
				</h2>
				{isNew && (
					<Badge color="primary" variant="subtle">
						<Trans>New</Trans>
					</Badge>
				)}
				<time dateTime={release.date} className="text-sm text-muted">
					{formatReleaseDate(release.date, i18n.locale)}
				</time>
			</header>
			{release.intro && <p lang={contentLanguage}>{release.intro}</p>}
			{release.sections.map((section) => (
				<ReleaseSection
					key={section.kind}
					section={section}
					language={contentLanguage}
				/>
			))}
		</article>
	);
}
