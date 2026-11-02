import type { ChangelogSectionKind } from '~/changelog/changelog_section_kind';

export type ChangelogSection = {
	kind: ChangelogSectionKind;
	entries: string[];
};

export type ChangelogLanguage = 'en' | 'fr';

export type ChangelogRelease = {
	version: string;
	date: string;
	intro: string | null;
	sections: ChangelogSection[];
};

export type LocalizedRelease = {
	release: ChangelogRelease;
	language: ChangelogLanguage;
};
