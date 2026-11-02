import type {
	ChangelogRelease,
	ChangelogSection,
} from '~/changelog/changelog_release';
import {
	CHANGELOG_SECTION_KINDS,
	type ChangelogSectionKind,
} from '~/changelog/changelog_section_kind';

const RELEASE_HEADING = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})\s*$/;
const ANY_RELEASE_HEADING = /^## /;
const KIND_HEADING = /^### (.+?)\s*$/;
const LINK_REFERENCE = /^\[[^\]]+\]:\s/;
const ENTRY_LINE = /^- (.*)$/;
const CONTINUATION_LINE = /^\s+\S/;

type DraftRelease = {
	version: string;
	date: string;
	introLines: string[];
	sections: ChangelogSection[];
	isInIntro: boolean;
};

type ParseState = {
	releases: DraftRelease[];
	release: DraftRelease | null;
	section: ChangelogSection | null;
};

function isSectionKind(kind: string): kind is ChangelogSectionKind {
	return (CHANGELOG_SECTION_KINDS as readonly string[]).includes(kind);
}

function toRelease(draft: Readonly<DraftRelease>): ChangelogRelease {
	return {
		version: draft.version,
		date: draft.date,
		intro: draft.introLines.length > 0 ? draft.introLines.join(' ') : null,
		sections: draft.sections.filter(({ entries }) => entries.length > 0),
	};
}

function startRelease(state: ParseState, version: string, date: string): void {
	state.release = {
		version,
		date,
		introLines: [],
		sections: [],
		isInIntro: true,
	};
	state.section = null;
	state.releases.push(state.release);
}

function startSection(state: ParseState, release: DraftRelease, kind: string) {
	release.isInIntro = false;
	state.section = isSectionKind(kind) ? { kind, entries: [] } : null;
	if (state.section) release.sections.push(state.section);
}

function appendToLastEntry(section: ChangelogSection, text: string): void {
	const lastIndex = section.entries.length - 1;
	const lastEntry = section.entries[lastIndex];
	if (lastEntry === undefined) return;
	section.entries[lastIndex] = `${lastEntry} ${text}`;
}

function readLine(state: ParseState, line: string): void {
	const release = RELEASE_HEADING.exec(line);
	if (release?.[1] && release[2])
		return startRelease(state, release[1], release[2]);
	if (ANY_RELEASE_HEADING.test(line)) {
		state.release = null;
		state.section = null;
		return;
	}
	if (!state.release || LINK_REFERENCE.test(line)) return;

	const kind = KIND_HEADING.exec(line)?.[1];
	if (kind !== undefined) return startSection(state, state.release, kind);
	if (state.release.isInIntro && line.trim() !== '') {
		state.release.introLines.push(line.trim());
		return;
	}
	if (!state.section) return;
	const entry = ENTRY_LINE.exec(line)?.[1];
	if (entry !== undefined) state.section.entries.push(entry.trim());
	else if (CONTINUATION_LINE.test(line))
		appendToLastEntry(state.section, line.trim());
}

/**
 * Reads a Keep a Changelog file into its dated releases, in file order (newest
 * first). Skips `Unreleased`, link references and unknown headings, and never
 * throws: what it cannot read is left out.
 */
export function parseChangelog(markdown: string): ChangelogRelease[] {
	const state: ParseState = { releases: [], release: null, section: null };
	for (const line of markdown.split(/\r?\n/)) readLine(state, line);
	return state.releases.map(toRelease);
}
