import frenchChangelog from '#CHANGELOG.fr.md?raw';
import englishChangelog from '#CHANGELOG.md?raw';

export const CHANGELOG_SOURCES = {
	english: englishChangelog,
	french: frenchChangelog,
} as const;
