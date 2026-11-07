/**
 * Similarity between 0 and 1: 1 minus the Levenshtein distance divided by the
 * length of the longer text. Two empty texts are identical.
 */
export function levenshteinSimilarity(first: string, second: string): number {
	const longestLength = Math.max(first.length, second.length);
	if (longestLength === 0) return 1;

	let previousRow = Array.from(
		{ length: second.length + 1 },
		(_, index) => index
	);
	for (let firstIndex = 1; firstIndex <= first.length; firstIndex++) {
		const currentRow = [firstIndex];
		for (let secondIndex = 1; secondIndex <= second.length; secondIndex++) {
			const substitutionCost =
				first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
			currentRow.push(
				Math.min(
					previousRow[secondIndex] + 1,
					currentRow[secondIndex - 1] + 1,
					previousRow[secondIndex - 1] + substitutionCost
				)
			);
		}
		previousRow = currentRow;
	}

	return 1 - previousRow[second.length] / longestLength;
}
