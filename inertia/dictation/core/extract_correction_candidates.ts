import { diffWords, type ChangeObject } from 'diff';

import type { CorrectionPair } from './correction_pair';
import { levenshteinSimilarity } from './levenshtein_similarity';
import { normalizeForComparison } from './normalize_for_comparison';
import { normalizeWordSequence } from './normalize_word_sequence';

const MAX_EDIT_LENGTH = 50;
const MAX_WORDS_PER_SIDE = 3;
const MAX_CHARACTERS_PER_SIDE = 60;
const MIN_SIMILARITY = 0.5;
const MAX_SHORT_HEARD_LENGTH = 2;
const EDGE_PUNCTUATION = /^[\p{P}\s]+|[\p{P}\s]+$/gu;
const WHITESPACE_RUN = /\s+/g;

type Hunk = {
	heard: string;
	written: string;
};

const cleanSide = (text: string): string =>
	text.replace(EDGE_PUNCTUATION, '').replace(WHITESPACE_RUN, ' ');

const countWords = (text: string): number => text.split(' ').length;

const isWithinSideLimits = (text: string): boolean =>
	text.length > 0 &&
	text.length <= MAX_CHARACTERS_PER_SIDE &&
	countWords(text) <= MAX_WORDS_PER_SIDE;

const isWhitespaceOnly = (change: ChangeObject<string>): boolean =>
	!change.added && !change.removed && change.value.trim() === '';

const isChange = (change: ChangeObject<string>): boolean =>
	change.added || change.removed;

/**
 * Groups the changes into hunks: consecutive changes, possibly separated by
 * whitespace-only common parts, with the removed and added text of each side
 * concatenated in order.
 */
function collectHunks(changes: ReadonlyArray<ChangeObject<string>>): Hunk[] {
	const hunks: Hunk[] = [];
	let openHunk: Hunk | undefined;

	changes.forEach((change, index) => {
		if (isChange(change)) {
			openHunk ??= { heard: '', written: '' };
			if (change.removed) openHunk.heard += change.value;
			if (change.added) openHunk.written += change.value;
			return;
		}
		if (isWhitespaceOnly(change) && index < changes.length - 1 && openHunk) {
			openHunk.heard += change.value;
			openHunk.written += change.value;
			return;
		}
		if (openHunk) hunks.push(openHunk);
		openHunk = undefined;
	});
	if (openHunk) hunks.push(openHunk);

	return hunks;
}

function isPlausibleCorrection(pair: CorrectionPair): boolean {
	if (!isWithinSideLimits(pair.heard) || !isWithinSideLimits(pair.written))
		return false;

	const heardWords = normalizeWordSequence(pair.heard);
	const writtenWords = normalizeWordSequence(pair.written);
	if (heardWords === '' || writtenWords === '' || heardWords === writtenWords)
		return false;

	const heardForm = normalizeForComparison(pair.heard);
	const writtenForm = normalizeForComparison(pair.written);
	if (
		countWords(pair.heard) === 1 &&
		heardForm.length <= MAX_SHORT_HEARD_LENGTH
	)
		return false;

	return levenshteinSimilarity(heardForm, writtenForm) >= MIN_SIMILARITY;
}

const toPairKey = (pair: CorrectionPair): string =>
	`${pair.heard.toLowerCase()}\u0000${pair.written.toLowerCase()}`;

/**
 * Finds the words the user replaced between two versions of a draft, as
 * (heard, written) pairs worth remembering. Only substitutions of one to three
 * similar words qualify; a diff too large to be a few edits yields nothing.
 */
export function extractCorrectionCandidates(
	baseline: string,
	current: string,
	knownPairs: ReadonlyArray<CorrectionPair>
): readonly CorrectionPair[] {
	const changes = diffWords(baseline, current, {
		maxEditLength: MAX_EDIT_LENGTH,
	});
	if (!changes) return [];

	const seenKeys = new Set(knownPairs.map(toPairKey));
	const candidates: CorrectionPair[] = [];
	for (const hunk of collectHunks(changes)) {
		const pair = {
			heard: cleanSide(hunk.heard),
			written: cleanSide(hunk.written),
		};
		if (!isPlausibleCorrection(pair)) continue;
		const key = toPairKey(pair);
		if (seenKeys.has(key)) continue;
		seenKeys.add(key);
		candidates.push(pair);
	}

	return candidates;
}
