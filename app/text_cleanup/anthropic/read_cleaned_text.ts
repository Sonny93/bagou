/** Extracts `cleaned_text` from the model's JSON output, or `undefined` when malformed. */
export function readCleanedText(rawJson: string): string | undefined {
	try {
		const parsed: unknown = JSON.parse(rawJson);
		if (typeof parsed !== 'object' || parsed === null) return undefined;
		const cleanedText = (parsed as Record<string, unknown>).cleaned_text;
		return typeof cleanedText === 'string' ? cleanedText : undefined;
	} catch {
		return undefined;
	}
}
