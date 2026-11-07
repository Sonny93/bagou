import type { CorrectionPair } from './correction_pair';
import { extractCorrectionCandidates } from './extract_correction_candidates';
import { isSameCorrectionPair } from './is_same_correction_pair';

/**
 * `baseline` is the last draft text the user did not type: what the hand
 * edits are measured against. `flushed` holds the corrections captured when
 * the baseline moved; they stay until resolved. `live` holds the corrections
 * of the current text against the current baseline, recomputed on every
 * edit. `queue` is `flushed` then `live`, what is offered to the user.
 * `knownPairs` are never suggested again.
 */
export type CorrectionSuggestions = {
	readonly baseline: string;
	readonly flushed: readonly CorrectionPair[];
	readonly live: readonly CorrectionPair[];
	readonly queue: readonly CorrectionPair[];
	readonly knownPairs: readonly CorrectionPair[];
};

export type CorrectionSuggestionsEvent =
	| { type: 'edited'; currentText: string }
	| { type: 'rebased'; currentText: string; baseline: string }
	| { type: 'resolved'; pair: CorrectionPair };

export const createCorrectionSuggestions = (
	knownPairs: readonly CorrectionPair[]
): CorrectionSuggestions => ({
	baseline: '',
	flushed: [],
	live: [],
	queue: [],
	knownPairs,
});

const withPairs = (
	state: CorrectionSuggestions,
	flushed: readonly CorrectionPair[],
	live: readonly CorrectionPair[]
): CorrectionSuggestions => ({
	...state,
	flushed,
	live,
	queue: [...flushed, ...live],
});

const arePairsEqual = (
	first: readonly CorrectionPair[],
	second: readonly CorrectionPair[]
): boolean =>
	first.length === second.length &&
	first.every((pair, index) => {
		const other = second[index];
		return (
			other !== undefined &&
			pair.heard === other.heard &&
			pair.written === other.written
		);
	});

const extractFrom = (
	state: CorrectionSuggestions,
	currentText: string
): readonly CorrectionPair[] =>
	extractCorrectionCandidates(state.baseline, currentText, [
		...state.knownPairs,
		...state.flushed,
	]);

const recomputeLive = (
	state: CorrectionSuggestions,
	currentText: string
): CorrectionSuggestions => {
	const live = extractFrom(state, currentText);
	return arePairsEqual(live, state.live)
		? state
		: withPairs(state, state.flushed, live);
};

const flushLive = (
	state: CorrectionSuggestions,
	currentText: string,
	baseline: string
): CorrectionSuggestions => ({
	...withPairs(
		state,
		[...state.flushed, ...extractFrom(state, currentText)],
		[]
	),
	baseline,
});

const withoutPair = (
	pairs: readonly CorrectionPair[],
	pair: CorrectionPair
): readonly CorrectionPair[] =>
	pairs.filter((candidate) => !isSameCorrectionPair(candidate, pair));

/**
 * Keeps the corrections to offer. `edited` recomputes the live ones from
 * scratch, so a half-typed word or a reverted edit leaves nothing behind.
 * `rebased` is for the text being replaced by something the user did not type:
 * the live corrections are first moved to the flushed ones, which survive,
 * then the baseline moves. `resolved` drops a pair that was remembered or
 * dismissed from both lists and never suggests it again.
 */
export function correctionSuggestionsReducer(
	state: CorrectionSuggestions,
	event: CorrectionSuggestionsEvent
): CorrectionSuggestions {
	switch (event.type) {
		case 'edited':
			return recomputeLive(state, event.currentText);
		case 'rebased':
			return flushLive(state, event.currentText, event.baseline);
		case 'resolved':
			return {
				...withPairs(
					state,
					withoutPair(state.flushed, event.pair),
					withoutPair(state.live, event.pair)
				),
				knownPairs: [...state.knownPairs, event.pair],
			};
	}
}
