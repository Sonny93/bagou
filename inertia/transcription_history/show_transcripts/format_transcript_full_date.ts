export function formatTranscriptFullDate(
	isoDate: string,
	locale: string
): string {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(isoDate));
}
