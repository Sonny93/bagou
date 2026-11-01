export type LeavableVisit = {
	url: { pathname: string };
	only: readonly string[];
	except: readonly string[];
	preserveState: unknown;
};

/**
 * A visit leaves the page when it goes to another path, or when it is a full
 * visit that does not keep the page state: the page remounts and loses what
 * was typed. A partial reload (`only` or `except`) or a visit with
 * `preserveState: true` keeps the page mounted.
 */
export function doesVisitLeavePage(
	visit: Readonly<LeavableVisit>,
	currentPathname: string
): boolean {
	if (visit.url.pathname !== currentPathname) return true;
	const isPartial = visit.only.length > 0 || visit.except.length > 0;
	return !isPartial && visit.preserveState !== true;
}
