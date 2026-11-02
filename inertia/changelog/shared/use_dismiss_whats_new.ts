import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { focusMain } from '~/changelog/shared/focus_main';
import { markChangelogSeen } from '~/changelog/shared/mark_changelog_seen';
import { reportError } from '~/shared/errors/report_error';

const DISMISS_FAILURE_TOAST_ID = 'dismiss-whats-new-failure';

type UseDismissWhatsNewReturn = {
	isDismissed: boolean;
	dismiss: () => void;
};

/**
 * Hides the banner right away and records the version as seen without an
 * Inertia visit, which would trigger the leave confirmation of the dictation
 * page and remount its state.
 */
export function useDismissWhatsNew(): UseDismissWhatsNewReturn {
	const { t } = useLingui();
	const [isDismissed, setIsDismissed] = useState(false);

	const dismiss = () => {
		focusMain();
		setIsDismissed(true);
		markChangelogSeen().catch((error: unknown) =>
			reportError(t`Could not save that you saw what's new`, error, {
				toastId: DISMISS_FAILURE_TOAST_ID,
			})
		);
	};

	return { isDismissed, dismiss };
}
