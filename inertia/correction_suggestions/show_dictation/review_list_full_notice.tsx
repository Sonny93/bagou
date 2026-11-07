import { Link } from '@adonisjs/inertia/react';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/shared/lib/url_for';

export const ReviewListFullNotice = () => (
	<p className="rounded-md border border-line p-3 text-sm">
		<Trans>
			Your list of corrections is full, so nothing more can be remembered.
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
