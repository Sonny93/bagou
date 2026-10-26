import type { DictationTranscript } from '~/dictation/core/dictation_transcript';

type DraftEditor = {
	insertSegment: (segment: string) => string;
	replaceDraft: (text: string) => string;
};

type DraftUpdate = { draftText: string; isCleaned: boolean };

const isBlank = (text: string): boolean => text.trim() === '';

function updateDraft(
	{ rawText, cleanedDraft }: Readonly<DictationTranscript>,
	{ insertSegment, replaceDraft }: Readonly<DraftEditor>
): DraftUpdate {
	if (isBlank(rawText)) {
		return { draftText: insertSegment(rawText), isCleaned: true };
	}
	if (cleanedDraft !== null) {
		return { draftText: replaceDraft(cleanedDraft), isCleaned: true };
	}
	return { draftText: insertSegment(rawText), isCleaned: false };
}

/**
 * Brings the server's answer into the draft: a blank segment leaves it
 * untouched, a cleaned draft replaces it as a whole, and without one the raw
 * segment is inserted at the caret. Then copies the whole draft; a blank draft
 * is not copied. Returns whether the draft was cleaned.
 */
export async function finalizeDictation(
	transcript: Readonly<DictationTranscript>,
	draftEditor: Readonly<DraftEditor>,
	copyText: (text: string) => Promise<unknown>
): Promise<boolean> {
	const { draftText, isCleaned } = updateDraft(transcript, draftEditor);
	if (!isBlank(draftText)) await copyText(draftText);
	return isCleaned;
}
