export type DraftSelection = {
	start: number;
	end: number;
};

type DraftSplit = {
	textBefore: string;
	separatorBefore: string;
	separatorAfter: string;
	textAfter: string;
};

type DraftInsertion = {
	text: string;
	caret: number;
};

const SEPARATOR = ' ';

const clampIndex = (index: number, length: number): number =>
	Math.min(Math.max(index, 0), length);

const endsWithWhitespace = (text: string): boolean => /\s$/.test(text);

const startsWithWhitespace = (text: string): boolean => /^\s/.test(text);

/**
 * Cuts the draft around the selection, which the segment replaces, and decides
 * which single spaces keep the segment apart from its neighbours. A blank
 * segment needs no separator. Out-of-range selections are clamped.
 */
export function splitDraft(
	text: string,
	selection: Readonly<DraftSelection>,
	segment: string
): DraftSplit {
	const start = clampIndex(selection.start, text.length);
	const end = clampIndex(selection.end, text.length);
	const textBefore = text.slice(0, Math.min(start, end));
	const textAfter = text.slice(Math.max(start, end));
	const hasSegment = segment.trim() !== '';

	return {
		textBefore,
		separatorBefore:
			hasSegment && textBefore !== '' && !endsWithWhitespace(textBefore)
				? SEPARATOR
				: '',
		separatorAfter:
			hasSegment && textAfter !== '' && !startsWithWhitespace(textAfter)
				? SEPARATOR
				: '',
		textAfter,
	};
}

/**
 * Inserts the trimmed segment in place of the selection. The caret lands right
 * after the segment so the next one continues from there. A blank segment
 * leaves the draft, selection included, untouched.
 */
export function insertSegment(
	text: string,
	selection: Readonly<DraftSelection>,
	segment: string
): DraftInsertion {
	const trimmedSegment = segment.trim();
	if (trimmedSegment === '') {
		return { text, caret: clampIndex(selection.end, text.length) };
	}

	const { textBefore, separatorBefore, separatorAfter, textAfter } = splitDraft(
		text,
		selection,
		trimmedSegment
	);

	return {
		text:
			textBefore +
			separatorBefore +
			trimmedSegment +
			separatorAfter +
			textAfter,
		caret: textBefore.length + separatorBefore.length + trimmedSegment.length,
	};
}
