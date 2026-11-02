import { useLingui } from '@lingui/react/macro';

import type {
	ChangelogLanguage,
	ChangelogSection,
} from '~/changelog/changelog_release';
import { ChangelogText } from '~/changelog/show_changelog/changelog_text';
import { describeSectionKind } from '~/changelog/show_changelog/describe_section_kind';

type ReleaseSectionProps = {
	section: ChangelogSection;
	language: ChangelogLanguage | undefined;
};

export function ReleaseSection({
	section,
	language,
}: Readonly<ReleaseSectionProps>) {
	const { i18n } = useLingui();

	return (
		<section className="flex flex-col gap-1.5">
			<h3 className="text-sm font-semibold text-muted">
				{describeSectionKind(section.kind, i18n)}
			</h3>
			<ul
				lang={language}
				className="flex list-disc flex-col gap-1.5 pl-5 marker:text-muted"
			>
				{section.entries.map((entry) => (
					<li key={entry}>
						<ChangelogText text={entry} />
					</li>
				))}
			</ul>
		</section>
	);
}
