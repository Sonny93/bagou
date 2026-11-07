import type { CorrectionPair } from '~/dictation/core/correction_pair';

const KEY_SEPARATOR = '\u0000';

/** A stable key for a correction, ignoring letter case as `isSameCorrectionPair` does. */
export const getPairKey = ({
	heard,
	written,
}: Readonly<CorrectionPair>): string =>
	`${heard.toLowerCase()}${KEY_SEPARATOR}${written.toLowerCase()}`;
