import { useEffect } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';

type UsePushWhenHiddenOptions = {
	getQueue: () => readonly CorrectionPair[];
	getDraftId: () => string;
	pushPairsBeforeLeaving: (
		pairs: readonly CorrectionPair[],
		draftId: string
	) => void;
};

/**
 * Hands the server the corrections of the draft as soon as the page is hidden
 * or left, since the page may never come back: a tab put away, a closed
 * window or a phone locked. An in-app navigation fires neither event, so the
 * page unmounting pushes too; that only happens once the visit went ahead, and
 * a pair already pushed is not sent again.
 */
export function usePushWhenHidden({
	getQueue,
	getDraftId,
	pushPairsBeforeLeaving,
}: Readonly<UsePushWhenHiddenOptions>): void {
	useEffect(() => {
		const pushQueue = () => pushPairsBeforeLeaving(getQueue(), getDraftId());
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') pushQueue();
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('pagehide', pushQueue);
		return () => {
			pushQueue();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('pagehide', pushQueue);
		};
	}, [getQueue, getDraftId, pushPairsBeforeLeaving]);
}
