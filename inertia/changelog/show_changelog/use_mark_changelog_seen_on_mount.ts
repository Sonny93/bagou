import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';

import { markChangelogSeen } from '~/changelog/shared/mark_changelog_seen';
import { reportError } from '~/shared/errors/report_error';

const MARK_SEEN_FAILURE_TOAST_ID = 'mark-changelog-seen-failure';

/** Records the current version as seen once the page is shown. */
export function useMarkChangelogSeenOnMount(): void {
	const { t } = useLingui();
	const failureMessage = t`Could not save that you saw what's new`;

	useEffect(() => {
		markChangelogSeen().catch((error: unknown) =>
			reportError(failureMessage, error, {
				toastId: MARK_SEEN_FAILURE_TOAST_ID,
			})
		);
	}, [failureMessage]);
}
