export function formatTranscriptDate(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(isoDate));
}
