import { router } from '@inertiajs/react';
import { useEffect } from 'react';

import type { DictationState } from '~/dictation/core/dictation_state';

const ENDED_STATUSES = new Set<DictationState['status']>([
	'done',
	'cancelled',
	'error',
]);

/** Reloads the remaining minutes prop each time a dictation ends. */
export function useRefreshRemainingQuota(
	status: DictationState['status']
): void {
	useEffect(() => {
		if (!ENDED_STATUSES.has(status)) return;
		router.reload({ only: ['remainingMinutes'] });
	}, [status]);
}
