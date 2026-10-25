const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
	dateStyle: 'medium',
});

export function formatPasskeyDate(isoDate: string): string {
	return DATE_FORMATTER.format(new Date(isoDate));
}
