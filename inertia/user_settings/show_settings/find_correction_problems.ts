export type CorrectionProblems = {
	heard: string | null;
	written: string | null;
};

const FORBIDDEN_CHARACTERS = /[\r\n<>]/;

const findSideProblem = (side: string, maxLength: number): string | null => {
	if (side === '') return 'required';
	if (side.length > maxLength) return 'maxLength';
	return FORBIDDEN_CHARACTERS.test(side) ? 'regex' : null;
};

/**
 * Checks a correction before it is sent, like the server does, with the same
 * rule names: each side (trimmed) must be filled, short enough and free of
 * line breaks and angle brackets, and the two must differ.
 */
export function findCorrectionProblems(
	heard: string,
	written: string,
	maxSideLength: number
): CorrectionProblems {
	const trimmedHeard = heard.trim();
	const trimmedWritten = written.trim();
	const problems = {
		heard: findSideProblem(trimmedHeard, maxSideLength),
		written: findSideProblem(trimmedWritten, maxSideLength),
	};
	if (problems.heard !== null || problems.written !== null) return problems;
	return {
		...problems,
		written: trimmedHeard === trimmedWritten ? 'notSameAs' : null,
	};
}
