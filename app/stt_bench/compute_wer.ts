import { splitWords } from '#stt_bench/normalize_text';
import type { WerScore } from '#stt_bench/wer_score';

const PERCENT = 100;

type EditCounts = Pick<WerScore, 'substitutions' | 'deletions' | 'insertions'>;

function buildCostMatrix(
	referenceWords: readonly string[],
	hypothesisWords: readonly string[]
): number[][] {
	const costs = Array.from({ length: referenceWords.length + 1 }, (_, row) =>
		Array.from({ length: hypothesisWords.length + 1 }, (_, column) =>
			row === 0 ? column : column === 0 ? row : 0
		)
	);
	for (let row = 1; row <= referenceWords.length; row += 1) {
		for (let column = 1; column <= hypothesisWords.length; column += 1) {
			const substitutionCost =
				referenceWords[row - 1] === hypothesisWords[column - 1] ? 0 : 1;
			costs[row][column] = Math.min(
				costs[row - 1][column - 1] + substitutionCost,
				costs[row - 1][column] + 1,
				costs[row][column - 1] + 1
			);
		}
	}
	return costs;
}

function countEdits(
	referenceWords: readonly string[],
	hypothesisWords: readonly string[]
): EditCounts {
	const costs = buildCostMatrix(referenceWords, hypothesisWords);
	let substitutions = 0;
	let deletions = 0;
	let insertions = 0;
	let row = referenceWords.length;
	let column = hypothesisWords.length;
	while (row > 0 || column > 0) {
		const isMatch = referenceWords[row - 1] === hypothesisWords[column - 1];
		const diagonalCost = costs[row - 1]?.[column - 1];
		if (
			diagonalCost !== undefined &&
			costs[row][column] === diagonalCost + (isMatch ? 0 : 1)
		) {
			if (!isMatch) substitutions += 1;
			row -= 1;
			column -= 1;
		} else if (row > 0 && costs[row][column] === costs[row - 1][column] + 1) {
			deletions += 1;
			row -= 1;
		} else {
			insertions += 1;
			column -= 1;
		}
	}
	return { substitutions, deletions, insertions };
}

/**
 * Word error rate of `hypothesis` against `reference` over normalised text.
 * An empty reference scores 0% for an empty hypothesis and 100% otherwise.
 */
export function computeWer(reference: string, hypothesis: string): WerScore {
	const referenceWords = splitWords(reference);
	const hypothesisWords = splitWords(hypothesis);
	const edits = countEdits(referenceWords, hypothesisWords);
	const errorCount = edits.substitutions + edits.deletions + edits.insertions;
	const errorRatio =
		referenceWords.length === 0
			? Math.min(errorCount, 1)
			: errorCount / referenceWords.length;
	return {
		...edits,
		errorRatePercent: errorRatio * PERCENT,
		referenceWordCount: referenceWords.length,
	};
}
