export function formatTranscriptTime(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(
		new Date(isoDate)
	);
}
