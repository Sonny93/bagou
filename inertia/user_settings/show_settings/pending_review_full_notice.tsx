import { Trans, useLingui } from '@lingui/react/macro';

import { LIST_FULL_MESSAGE } from '~/correction_suggestions/review/list_full_message';

export function PendingReviewFullNotice() {
	const { i18n } = useLingui();

	return (
		<p className="rounded-md border border-line p-3 text-sm">
			{i18n._(LIST_FULL_MESSAGE)}{' '}
			<Trans>
				Dismiss suggestions here, or delete corrections below to make room.
			</Trans>
		</p>
	);
}
