export const MIN_SUGGESTIONS_REFRESH_INTERVAL_MS = 30_000;

type ShouldRefreshSuggestionsOptions = {
	now: number;
	lastRefreshAt: number;
	isDrawerOpen: boolean;
	isPushing: boolean;
};

/**
 * Whether the suggestions are worth fetching again when the tab comes back:
 * not while the drawer is open (its rows must not move under the user's
 * hands) nor while a push is in flight (its answer is about to replace the
 * list), and not more than once per interval.
 */
export const shouldRefreshSuggestions = ({
	now,
	lastRefreshAt,
	isDrawerOpen,
	isPushing,
}: Readonly<ShouldRefreshSuggestionsOptions>): boolean =>
	!isDrawerOpen &&
	!isPushing &&
	now - lastRefreshAt >= MIN_SUGGESTIONS_REFRESH_INTERVAL_MS;
