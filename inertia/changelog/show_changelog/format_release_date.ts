/** Formats a `YYYY-MM-DD` release date in the given locale, without any time zone shift. */
export function formatReleaseDate(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'long',
		timeZone: 'UTC',
	}).format(new Date(`${isoDate}T00:00:00Z`));
}
