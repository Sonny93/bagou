const MILLISECONDS_PER_DAY = 86_400_000;
const MAX_RELATIVE_DAYS = 2;

function countCalendarDays(from: Date, to: Date): number {
	const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
	const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
	return Math.round((toUtc - fromUtc) / MILLISECONDS_PER_DAY);
}

function capitalize(text: string, locale: string): string {
	const [first = ''] = text;
	return first.toLocaleUpperCase(locale) + text.slice(first.length);
}

export function formatDayLabel(day: Date, now: Date, locale: string): string {
	const daysAgo = Math.max(0, countCalendarDays(day, now));

	if (daysAgo <= MAX_RELATIVE_DAYS) {
		const relative = new Intl.RelativeTimeFormat(locale, {
			numeric: 'auto',
		}).format(-daysAgo, 'day');
		return capitalize(relative, locale);
	}

	const isSameYear = day.getFullYear() === now.getFullYear();
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'long',
		year: isSameYear ? undefined : 'numeric',
	}).format(day);
}
