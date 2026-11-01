import {
	doesVisitLeavePage,
	type LeavableVisit,
} from './does_visit_leave_page';

type LeaveGuardOptions<TVisit extends LeavableVisit> = {
	confirm: () => Promise<boolean>;
	replay: (visit: TVisit) => void;
	getCurrentPathname: () => string;
};

export type LeaveGuard<TVisit extends LeavableVisit> = {
	shouldAllow: (visit: TVisit) => boolean;
};

/**
 * Decides, for each visit, whether it may go on. A visit that leaves the page
 * is blocked and confirmed; when confirmed it is replayed once, and that
 * replay is let through. While a confirmation is open, other leaving visits
 * are blocked without opening a second one.
 */
export function createLeaveGuard<TVisit extends LeavableVisit>({
	confirm,
	replay,
	getCurrentPathname,
}: Readonly<LeaveGuardOptions<TVisit>>): LeaveGuard<TVisit> {
	let isReplaying = false;
	let isAsking = false;

	const replayOnce = (visit: TVisit): void => {
		isReplaying = true;
		try {
			replay(visit);
		} finally {
			isReplaying = false;
		}
	};

	const askThenReplay = async (visit: TVisit): Promise<void> => {
		isAsking = true;
		try {
			if (await confirm()) replayOnce(visit);
		} finally {
			isAsking = false;
		}
	};

	const shouldAllow = (visit: TVisit): boolean => {
		if (isReplaying) return true;
		if (!doesVisitLeavePage(visit, getCurrentPathname())) return true;
		if (!isAsking) void askThenReplay(visit);
		return false;
	};

	return { shouldAllow };
}
