/**
 * Wraps the copy so that it only runs while automatic copy is on, asked at the
 * moment of copying so a setting changed meanwhile applies to the next one.
 * Returns whether the text was copied.
 */
export function createAutoCopy(
	copyText: (text: string) => Promise<boolean>,
	isAutoCopyEnabled: () => boolean
): (text: string) => Promise<boolean> {
	return async (text) => {
		if (!isAutoCopyEnabled()) return false;
		return copyText(text);
	};
}
