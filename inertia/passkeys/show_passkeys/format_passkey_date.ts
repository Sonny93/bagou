export function formatPasskeyDate(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
		new Date(isoDate)
	);
}
