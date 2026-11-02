import type {
	ChangelogRelease,
	LocalizedRelease,
} from '~/changelog/changelog_release';

type ReleaseSources = {
	english: readonly ChangelogRelease[];
	french: readonly ChangelogRelease[];
};

/**
 * Lists the English releases, each replaced by its French twin when the locale
 * is French and that version exists in the French changelog. Each item tells
 * the language of its content, which differs from the locale on a fallback.
 */
export function pickLocalizedReleases(
	{ english, french }: Readonly<ReleaseSources>,
	locale: string
): LocalizedRelease[] {
	const isFrench = locale.startsWith('fr');
	return english.map((release) => {
		const twin = isFrench
			? french.find(({ version }) => version === release.version)
			: undefined;
		return twin
			? { release: twin, language: 'fr' }
			: { release, language: 'en' };
	});
}
