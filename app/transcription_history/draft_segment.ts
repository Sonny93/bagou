/**
 * What one dictated segment adds to its draft's history entry. `cleanedDraft`
 * is the whole draft cleaned, `null` when the segment was not cleaned.
 */
export type DraftSegment = {
	rawSegment: string;
	cleanedDraft: string | null;
};
