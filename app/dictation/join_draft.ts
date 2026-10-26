import type { DraftContext } from '#dictation/draft_context';

const SEPARATOR = ' ';

const endsWithWhitespace = (text: string): boolean => /\s$/.test(text);

const startsWithWhitespace = (text: string): boolean => /^\s/.test(text);

/**
 * Builds the whole draft with the trimmed segment between the text before and
 * after the caret, a single space keeping it apart from non-empty neighbours
 * that do not already end or start with whitespace. Same rule as the front's
 * draft insertion.
 */
export function joinDraft(
	{
		textBefore,
		textAfter,
	}: Readonly<Pick<DraftContext, 'textBefore' | 'textAfter'>>,
	rawSegment: string
): string {
	const segment = rawSegment.trim();
	const separatorBefore =
		textBefore !== '' && !endsWithWhitespace(textBefore) ? SEPARATOR : '';
	const separatorAfter =
		textAfter !== '' && !startsWithWhitespace(textAfter) ? SEPARATOR : '';
	return textBefore + separatorBefore + segment + separatorAfter + textAfter;
}
