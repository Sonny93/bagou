type FinalizeDictationActions = {
	cleanText: (text: string) => Promise<string>;
	copyText: (text: string) => Promise<boolean>;
};

type FinalizedDictation = {
	text: string;
	isCleaned: boolean;
	isCopied: boolean;
};

/**
 * Cleans the raw text, then copies the result. A failing cleanup falls back to
 * the raw text so a dictation is never lost; an empty text needs neither.
 */
export async function finalizeDictation(
	rawText: string,
	{ cleanText, copyText }: Readonly<FinalizeDictationActions>
): Promise<FinalizedDictation> {
	if (rawText.trim() === '') {
		return { text: rawText, isCleaned: true, isCopied: false };
	}
	const { text, isCleaned } = await cleanOrKeep(rawText, cleanText);
	const isCopied = await copyText(text);
	return { text, isCleaned, isCopied };
}

async function cleanOrKeep(
	rawText: string,
	cleanText: FinalizeDictationActions['cleanText']
): Promise<{ text: string; isCleaned: boolean }> {
	try {
		return { text: await cleanText(rawText), isCleaned: true };
	} catch {
		return { text: rawText, isCleaned: false };
	}
}
