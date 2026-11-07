import type { CorrectionPair } from './correction_pair';

/** Whether two pairs are the same correction, ignoring letter case as the server does. */
export const isSameCorrectionPair = (
	first: Readonly<CorrectionPair>,
	second: Readonly<CorrectionPair>
): boolean =>
	first.heard.toLowerCase() === second.heard.toLowerCase() &&
	first.written.toLowerCase() === second.written.toLowerCase();
