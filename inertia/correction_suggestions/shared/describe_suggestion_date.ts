export type SuggestionDate =
	| { readonly kind: 'session' }
	| { readonly kind: 'today' }
	| { readonly kind: 'yesterday' }
	| { readonly kind: 'date'; readonly text: string };

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const getDayStart = (date: Date): number =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const formatDate = (date: Date, now: Date, locale: string): string =>
	new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'short',
		year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
	}).format(date);

/**
 * Where a suggestion comes from, relative to `now` in the viewer's time zone:
 * this page (no date), today, yesterday, or a short date in `locale`.
 */
export function describeSuggestionDate(
	createdAt: string | null,
	now: Date,
	locale: string
): SuggestionDate {
	if (createdAt === null) return { kind: 'session' };
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) return { kind: 'session' };
	const dayDifference = Math.round(
		(getDayStart(now) - getDayStart(date)) / MILLISECONDS_PER_DAY
	);
	if (dayDifference === 0) return { kind: 'today' };
	if (dayDifference === 1) return { kind: 'yesterday' };
	return { kind: 'date', text: formatDate(date, now, locale) };
}
