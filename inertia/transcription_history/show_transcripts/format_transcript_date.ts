const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
	dateStyle: 'medium',
	timeStyle: 'short',
});

export function formatTranscriptDate(isoDate: string): string {
	return DATE_FORMATTER.format(new Date(isoDate));
}
