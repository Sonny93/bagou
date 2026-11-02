import { router } from '@inertiajs/react';
import { ConfirmModal } from '@minimalstuff/ui';
import { useEffect } from 'react';

import { createLeaveGuard } from '~/shared/navigation/create_leave_guard';

type UseLeaveConfirmationOptions = {
	isBlocking: boolean;
	title: string;
	message: string;
	confirmLabel: string;
};

type PendingVisit = Parameters<
	Parameters<typeof router.on<'before'>>[1]
>[0]['detail']['visit'];

const preventUnload = (event: BeforeUnloadEvent): void => {
	event.preventDefault();
};

const replayVisit = (visit: Readonly<PendingVisit>): void => {
	router.visit(visit.url, {
		method: visit.method,
		data: visit.data,
		replace: visit.replace,
		preserveScroll: visit.preserveScroll,
		preserveState: visit.preserveState,
		only: visit.only,
		except: visit.except,
		headers: visit.headers,
		forceFormData: visit.forceFormData,
	});
};

/**
 * While `isBlocking`, asks before the user leaves the page: the browser's own
 * dialog for a tab close or a reload, and a confirmation modal for an Inertia
 * visit that leaves it (any method, so a logout is guarded too): a visit to
 * another path, or a full visit to the same path, such as the logo link, which
 * would remount the page and drop its state. Partial reloads and visits that
 * preserve the state are never blocked. When confirmed, the visit is replayed
 * as it was requested.
 * Browser back and forward (popstate) are not guarded: Inertia cannot cancel
 * them.
 */
export function useLeaveConfirmation({
	isBlocking,
	title,
	message,
	confirmLabel,
}: Readonly<UseLeaveConfirmationOptions>): void {
	useEffect(() => {
		if (!isBlocking) return;
		window.addEventListener('beforeunload', preventUnload);
		return () => window.removeEventListener('beforeunload', preventUnload);
	}, [isBlocking]);

	useEffect(() => {
		if (!isBlocking) return;
		const guard = createLeaveGuard<PendingVisit>({
			confirm: () =>
				ConfirmModal.call({
					title,
					confirmLabel,
					confirmColor: 'danger',
					children: message,
				}),
			replay: replayVisit,
			getCurrentPathname: () => window.location.pathname,
		});
		return router.on('before', (event) =>
			guard.shouldAllow(event.detail.visit)
		);
	}, [isBlocking, title, message, confirmLabel]);
}
