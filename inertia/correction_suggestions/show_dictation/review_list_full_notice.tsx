import { Link } from '@adonisjs/inertia/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { LIST_FULL_MESSAGE } from '~/correction_suggestions/review/list_full_message';
import { urlFor } from '~/shared/lib/url_for';

export function ReviewListFullNotice() {
	const { i18n } = useLingui();

	return (
		<p className="rounded-md border border-line p-3 text-sm">
			{i18n._(LIST_FULL_MESSAGE)}{' '}
			<Trans>
				Dismiss suggestions here, or make room in{' '}
				<Link
					href={`${urlFor('user_settings.show_settings')}#corrections`}
					className="underline"
				>
					the settings
				</Link>
				.
			</Trans>
		</p>
	);
}
