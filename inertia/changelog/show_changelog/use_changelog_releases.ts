import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

import type { LocalizedRelease } from '~/changelog/changelog_release';
import { parseChangelog } from '~/changelog/parse_changelog';
import { CHANGELOG_SOURCES } from '~/changelog/show_changelog/changelog_sources';
import { pickLocalizedReleases } from '~/changelog/show_changelog/pick_localized_releases';

const BUNDLED_RELEASES = {
	english: parseChangelog(CHANGELOG_SOURCES.english),
	french: parseChangelog(CHANGELOG_SOURCES.french),
};

/** The bundled releases, newest first, in the language of the interface. */
export function useChangelogReleases(): LocalizedRelease[] {
	const { i18n } = useLingui();
	return useMemo(
		() => pickLocalizedReleases(BUNDLED_RELEASES, i18n.locale),
		[i18n.locale]
	);
}
