const INLINE_CODE = /`([^`]+)`/g;

export type TextPart = {
	text: string;
	isCode: boolean;
	offset: number;
};

/**
 * Splits a changelog entry into plain text and `inline code` parts, in order.
 * The offset of a part in the entry is unique, so it works as a render key.
 */
export function splitInlineCode(text: string): TextPart[] {
	const parts: TextPart[] = [];
	let position = 0;
	for (const match of text.matchAll(INLINE_CODE)) {
		if (match.index > position) {
			parts.push({
				text: text.slice(position, match.index),
				isCode: false,
				offset: position,
			});
		}
		parts.push({ text: match[1] ?? '', isCode: true, offset: match.index });
		position = match.index + match[0].length;
	}
	if (position < text.length) {
		parts.push({ text: text.slice(position), isCode: false, offset: position });
	}
	return parts;
}
