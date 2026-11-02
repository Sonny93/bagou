import { Trans } from '@lingui/react/macro';

import { APP_VERSION } from '~/shared/lib/app_version';

export const MissingReleaseNotice = () => (
	<p className="rounded-xl border border-line bg-surface p-4 text-muted">
		<Trans>There are no release notes for version {APP_VERSION}.</Trans>
	</p>
);
